/**
 * PCI DSS Security Middleware
 * Covers: Req 6.4 (secure development), Req 8 (auth controls), Req 10 (audit logging)
 */
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// ─── 1. NoSQL / Prototype pollution sanitizer (PCI DSS 6.2.4) ────────────────

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function sanitizeObject(obj: any, depth = 0): any {
  if (depth > 10 || obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(item => sanitizeObject(item, depth + 1));
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (DANGEROUS_KEYS.has(key)) continue;
    // Strip MongoDB operator injection: keys starting with $ or containing .
    if (/^\$/.test(key) || key.includes(".")) continue;
    clean[key] = sanitizeObject(obj[key], depth + 1);
  }
  return clean;
}

export function noSqlSanitizer(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  // req.query is a read-only getter on IncomingMessage — mutate in-place instead
  if (req.query && typeof req.query === "object") {
    const cleaned = sanitizeObject(req.query);
    for (const key of Object.keys(req.query)) {
      if (!(key in cleaned)) {
        delete (req.query as any)[key];
      } else {
        (req.query as any)[key] = cleaned[key];
      }
    }
  }
  next();
}

// ─── 2. Request ID for audit trail (PCI DSS 10.2) ────────────────────────────

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = crypto.randomUUID();
  req.headers["x-request-id"] = id;
  res.setHeader("X-Request-ID", id);
  next();
}

// ─── 3. Security headers beyond Helmet (PCI DSS 6.4.1) ──────────────────────

export function additionalSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Cache-Control: no-store only on API routes — NOT on static assets/pages
  // (applying no-store globally kills browser caching of JS/CSS/images → slow site)
  if (req.path.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
  }
  // Prohibit older IE from guessing content type
  res.setHeader("X-Content-Type-Options", "nosniff");
  // X-Frame-Options removed — frame-ancestors in CSP controls embedding
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  // Prevent referrer leakage to third parties
  // Use "no-referrer-when-downgrade" for WebView compatibility (Snapchat / WhatsApp)
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  // Permissions-Policy: minimal restrictions — keep camera/mic off, allow payment API
  // (strict payment=() breaks some WebView environments including Snapchat in-app browser)
  res.setHeader("Permissions-Policy", "camera=(), microphone=()");
  next();
}

// ─── 4. HTTPS enforcement + www→non-www redirect (PCI DSS 4.2.1) ────────────

export function enforceHttps(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== "production") return next();

  const proto = req.headers["x-forwarded-proto"] as string | undefined;
  const host  = (req.headers.host || "").replace(/:\d+$/, ""); // strip port if any

  // Redirect www → non-www (must happen before HTTPS check to avoid double-redirect)
  if (host.startsWith("www.")) {
    const nonWww = host.slice(4);
    return res.redirect(301, `https://${nonWww}${req.url}`);
  }

  // Redirect HTTP → HTTPS
  if (proto && proto !== "https") {
    return res.redirect(301, `https://${host}${req.url}`);
  }

  next();
}

// ─── 5. Error sanitizer — never expose stack traces (PCI DSS 6.2.4) ──────────

export function sanitizeErrors(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;

  // In production: never expose internal error details
  if (process.env.NODE_ENV === "production") {
    const safeMessages: Record<number, string> = {
      400: "طلب غير صحيح",
      401: "غير مصرح",
      403: "ممنوع",
      404: "غير موجود",
      429: "طلبات كثيرة — يرجى الانتظار",
    };
    return res.status(status).json({
      error: safeMessages[status] || "خطأ داخلي في الخادم",
      requestId: _req.headers["x-request-id"],
    });
  }

  // In development: expose message but not stack
  return res.status(status).json({
    error: err.message || "Internal Server Error",
    requestId: _req.headers["x-request-id"],
  });
}

// ─── 6. Audit logger for sensitive endpoints (PCI DSS 10.2) ─────────────────

const SENSITIVE_PATTERNS = [
  /^\/api\/auth/,
  /^\/api\/admin/,
  /^\/api\/payments/,
  /^\/api\/donations/,
  /^\/api\/bank-transfers/,
  /^\/api\/users/,
  /^\/api\/employee/,
];

export function auditLogger(req: Request, res: Response, next: NextFunction) {
  if (!SENSITIVE_PATTERNS.some(p => p.test(req.path))) return next();

  const start = Date.now();
  const requestId = req.headers["x-request-id"];
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    || req.socket?.remoteAddress
    || "unknown";

  // Mask any bearer token in authorization header
  const authHeader = req.headers.authorization
    ? req.headers.authorization.replace(/Bearer\s+\S+/i, "Bearer [REDACTED]")
    : undefined;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const userId = (req as any).user?.id || (req as any).user?._id || "anonymous";

    // Only log auth, admin, and payment-related paths for audit
    const logEntry = {
      ts: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip,
      userId,
      userAgent: req.headers["user-agent"]?.slice(0, 120),
    };

    if (res.statusCode >= 400) {
      console.error("[AUDIT]", JSON.stringify(logEntry));
    } else {
      console.log("[AUDIT]", JSON.stringify(logEntry));
    }
  });

  next();
}

// ─── 7. File upload security (PCI DSS 6.2.4) ────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const DANGEROUS_EXTENSIONS = /\.(php|php3|php4|php5|phtml|exe|sh|bat|cmd|js|ts|py|rb|pl|cgi|asp|aspx|jsp|htaccess)$/i;

export function validateFileUpload(req: Request, res: Response, next: NextFunction) {
  if (!req.files) return next();
  const files = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files).flat();

  for (const file of files as Express.Multer.File[]) {
    if (DANGEROUS_EXTENSIONS.test(file.originalname)) {
      return res.status(400).json({ error: "نوع الملف غير مسموح به" });
    }
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: "حجم الملف كبير جداً (الحد الأقصى 10MB)" });
    }
    if (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return res.status(400).json({ error: "نوع الملف غير مدعوم" });
    }
  }
  next();
}
