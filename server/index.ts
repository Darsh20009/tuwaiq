import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { connectToMongo } from "./db";
import { connectMongoose } from "./core/database";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { generalLimiter, authLimiter } from "./core/rateLimiter";
import session from "express-session";
import passport from "passport";
import _MongoStore from "connect-mongo";
import {
  noSqlSanitizer,
  requestId,
  additionalSecurityHeaders,
  enforceHttps,
  auditLogger,
  sanitizeErrors,
} from "./core/securityMiddleware";
const MongoStore = (_MongoStore as any).default ?? _MongoStore;

// Module routes
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import campaignsRoutes from "./modules/campaigns/campaigns.routes";
import donationsRoutes from "./modules/donations/donations.routes";
import paymentsRoutes from "./modules/payments/payments.routes";
import beneficiariesRoutes from "./modules/beneficiaries/beneficiaries.routes";
import deliveriesRoutes from "./modules/deliveries/deliveries.routes";
import reportsRoutes from "./modules/reports/reports.routes";
import webauthnRoutes from "./modules/webauthn/webauthn.routes";
import recurringRoutes, { processDueRecurring } from "./modules/recurring/recurring.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import aiRoutes from "./modules/ai/ai.routes";
import casesRoutes from "./modules/cases/cases.routes";
import { setupWebSocket } from "./core/websocket";
import { createSEOMiddleware, registerSEORoutes, registerSitemapRoute } from "./seo";
import { db } from "./db";

const app = express();
app.set("trust proxy", 1);
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ── Apple Pay domain verification (must be served before any auth/security middleware) ──
app.use("/.well-known", express.static(path.join(process.cwd(), "client/public/.well-known"), {
  dotfiles: "allow",
  setHeaders: (res, filePath) => {
    if (filePath.endsWith("assetlinks.json")) {
      res.setHeader("Content-Type", "application/json");
    } else {
      res.setHeader("Content-Type", "text/plain");
    }
  },
}));

// ── Digital Asset Links (Google Play Store TWA verification) ──────────────────
app.get("/.well-known/assetlinks.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.sendFile(path.join(process.cwd(), "client/public/.well-known/assetlinks.json"));
});
// Explicit routes for both filename variants Apple may request
app.get("/.well-known/apple-developer-merchantid-domain-association", (_req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.sendFile(path.join(process.cwd(), "client/public/.well-known/apple-developer-merchantid-domain-association"));
});
app.get("/.well-known/apple-developer-merchantid-domain-association.txt", (_req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.sendFile(path.join(process.cwd(), "client/public/.well-known/apple-developer-merchantid-domain-association.txt"));
});

// ── Favicon (must be before SPA fallback and SEO middleware) ──────────────────
app.get("/favicon.ico", (_req, res) => {
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=604800");
  res.sendFile(path.join(process.cwd(), "client/public/favicon.png"));
});
app.get("/favicon.png", (_req, res) => {
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=604800");
  res.sendFile(path.join(process.cwd(), "client/public/favicon.png"));
});

// ── PCI DSS Security hardening ────────────────────────────────────────────────
app.use(enforceHttps);
app.use(requestId);
app.use(additionalSecurityHeaders);
app.use(noSqlSanitizer);

// Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https:", "data:"],
        connectSrc: ["'self'", "https:", ...(process.env.NODE_ENV !== "production" ? ["ws:", "wss:"] : [])],
        frameSrc: ["'self'", "https://payment.alrajhibank.com.sa", "https://digitalpayments.alrajhibank.com.sa", "https://accounts.google.com"],
        formAction: ["'self'", "https://securepayments.alrajhibank.com.sa", "https://digitalpayments.alrajhibank.com.sa", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Cookie parser for JWT
app.use(cookieParser());

// Rate limiting on API routes (PCI DSS 6.4: brute-force protection)
app.use("/api", generalLimiter);
app.use("/api", auditLogger);
// Strict rate limit on all auth paths
app.use("/api/auth", authLimiter);
app.use("/api/v2/auth", authLimiter);

app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect both MongoDB native driver (for legacy routes) and Mongoose (for new modules)
  await connectToMongo();
  await connectMongoose();

  // =====================
  // Session + Passport (must be before ALL routes so req.isAuthenticated() works everywhere)
  // =====================
  // [PCI DSS 8.2.4] Session secret must be set via environment — never fall back to a weak default
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 32) {
    console.error("[SECURITY] SESSION_SECRET is missing or too short (<32 chars). Set it in environment variables.");
    if (process.env.NODE_ENV === "production") {
      process.exit(1); // Refuse to start in production without a proper secret
    }
  }

  app.use(
    session({
      secret: sessionSecret || "dev_only_fallback_set_SESSION_SECRET_in_prod",
      resave: false,
      saveUninitialized: false,
      name: "twq.sid", // Don't use default 'connect.sid' (fingerprinting)
      cookie: {
        maxAge: 8 * 60 * 60 * 1000, // 8 hours — PCI DSS 8.2.8: idle timeout
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,  // [PCI DSS 6.4.2] Prevent JS access to session cookie
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      },
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: "sessions",
        ttl: 8 * 60 * 60,          // Match cookie maxAge
        autoRemove: "native",
        touchAfter: 60 * 60,        // Re-save at most once per hour
      }),
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // =====================
  // SEO middleware (bot detection for social media sharing)
  // =====================
  app.use(createSEOMiddleware(db));

  // =====================
  // New Module Routes (prefixed to avoid conflicts with legacy Passport auth routes)
  // =====================
  app.use("/api/v2/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/campaigns", campaignsRoutes);
  app.use("/api/donations", donationsRoutes);
  app.use("/api/payments", paymentsRoutes);
  app.use("/api/beneficiaries", beneficiariesRoutes);
  app.use("/api/deliveries", deliveriesRoutes);
  app.use("/api/reports", reportsRoutes);
  app.use("/api/auth/webauthn", webauthnRoutes);
  app.use("/api/recurring", recurringRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api", casesRoutes);

  // Setup WebSocket
  setupWebSocket(httpServer);

  // =====================
  // Legacy Routes (CMS, HR, Admin, etc.)
  // =====================
  await registerRoutes(httpServer, app);
  registerSEORoutes(app, db);
  registerSitemapRoute(app, db);

  // [PCI DSS 6.2.4] Sanitized error handler — never expose stack traces or internals
  app.use(sanitizeErrors);

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );

  // ── Recurring Donations Scheduler ─────────────────────────────────────────
  // Runs every hour: generates Al Rajhi payment links for due recurring donations
  // and emails them automatically to donors.
  const RECURRING_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  const runRecurringScheduler = async () => {
    try {
      const { processed, errors } = await processDueRecurring();
      if (processed > 0 || errors > 0) {
        log(`[Recurring Scheduler] processed=${processed} errors=${errors}`);
      }
    } catch (err: any) {
      console.error("[Recurring Scheduler] unexpected error:", err.message);
    }
  };
  // Run once on startup (catches any missed charges), then every hour
  setTimeout(runRecurringScheduler, 30_000);
  setInterval(runRecurringScheduler, RECURRING_INTERVAL_MS);

  // ── Expire stale pending payments after 3 hours ──────────────────────────
  // IMPORTANT: We ONLY auto-expire donations where the donor never reached Al Rajhi's
  // payment page (rajhiRef is absent/null/empty). If rajhiRef IS set, the donor was
  // redirected to the gateway and money may have been captured — we NEVER auto-fail
  // those. Admins can recover them via the batch-recovery tool.
  const expireStalePendingPayments = async () => {
    try {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const result = await db.collection("donations").updateMany(
        {
          status: "pending",
          paymentMethod: { $in: ["online", "rajhi"] },
          createdAt: { $lt: threeHoursAgo },
          // Only expire donations that never reached the gateway (no PaymentID stored).
          // If rajhiRef exists & is non-empty, the user reached Al Rajhi's payment page
          // and may have paid — leave those for manual/admin recovery.
          $or: [
            { paymentMethod: "online" },
            { rajhiRef: { $exists: false } },
            { rajhiRef: null },
            { rajhiRef: "" },
          ],
        },
        { $set: { status: "failed", expiredAt: new Date() } }
      );
      if (result.modifiedCount > 0) {
        log(`[Payment Expiry] Expired ${result.modifiedCount} stale pending donations (no gateway reach)`);
      }
    } catch (err: any) {
      console.error("[Payment Expiry] Error:", err.message);
    }
  };
  // Run once 5 minutes after startup, then every 30 minutes
  setTimeout(expireStalePendingPayments, 5 * 60 * 1000);
  setInterval(expireStalePendingPayments, 30 * 60 * 1000);
  // ──────────────────────────────────────────────────────────────────────────
})();
