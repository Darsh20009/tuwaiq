import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, donationsCollection, usersCollection, sliderItemsCollection } from "./db";
import { api } from "@shared/routes";
import { type User } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import MemoryStore from "memorystore";
import { ObjectId } from "mongodb";

// ── Simple in-memory TTL cache ──────────────────────────────────────
const _cache = new Map<string, { data: any; expiresAt: number }>();
function getCache<T>(key: string): T | null {
  const entry = _cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data as T;
  _cache.delete(key);
  return null;
}
function setCache(key: string, data: any, ttlMs = 120_000) {
  _cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}
function invalidateCache(...keys: string[]) {
  keys.forEach(k => _cache.delete(k));
}
// ────────────────────────────────────────────────────────────────────
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendEmail, emailTemplates, setMailDb } from "./mail";
import { generateCertificatePDF, generateInvoicePDF } from "./pdf";
import { initiateRajhiPayment, verifyRajhiCallback } from "./rajhi";
import { updateDonationStatus as confirmDonationStatus } from "./modules/donations/donations.service";

// Simple in-memory rate limiter for sensitive endpoints
const resetRateLimits = new Map<string, { count: number; resetAt: number }>();
function checkResetRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = resetRateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    resetRateLimits.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 min window
    return true;
  }
  if (entry.count >= 3) return false; // max 3 attempts per 15 min
  entry.count++;
  return true;
}

const scryptAsync = promisify(scrypt);

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage_multer });

// Memory-based multer for MongoDB storage (persistent across restarts)
const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Middleware to check role
function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "غير مصرح" });
    }
    const user = req.user as any;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "ليس لديك صلاحية" });
    }
    next();
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Connect mail logging to MongoDB
  setMailDb(db);

  // Session and passport are initialized in index.ts before module routes
  // Only configure the passport strategies here

  passport.use(
    new LocalStrategy(
      { usernameField: "mobile" },
      async (mobile, password, done) => {
        try {
          // Clean mobile number for lookup
          let cleanMobile = mobile.replace(/\s/g, "");
          if (cleanMobile.startsWith("+966")) cleanMobile = cleanMobile.slice(4);
          if (cleanMobile.startsWith("966")) cleanMobile = cleanMobile.slice(3);
          if (cleanMobile.startsWith("0")) cleanMobile = cleanMobile.slice(1);
          
          console.log(`Login attempt for mobile: ${mobile} (cleaned: ${cleanMobile})`);
          
          const user = await storage.getUserByMobile(cleanMobile);
          if (!user || !user.password || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "رقم الجوال أو كلمة المرور غير صحيحة" });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // ── Google OAuth 2.0 Strategy ──
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const devBase = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null;
    const baseUrl = process.env.VITE_APP_URL || (process.env.NODE_ENV !== "production" && devBase ? devBase : null) || process.env.BASE_URL || "https://tuwaiqassociation.sa";
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || `${baseUrl}/api/auth/google/callback`;
    console.log(`[Google OAuth] callbackURL = ${callbackURL}`);
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || "";
            const name = profile.displayName || email.split("@")[0] || "مستخدم جوجل";
            const googleId = profile.id;

            let user = await db.collection("users").findOne({ $or: [{ googleId }, ...(email ? [{ email }] : [])] });
            if (!user) {
              const insertRes = await db.collection("users").insertOne({
                name, email, googleId, mobile: "", role: "user", isPublicDonor: true, createdAt: new Date(),
              });
              user = await db.collection("users").findOne({ _id: insertRes.insertedId });
            } else if (!user.googleId) {
              await db.collection("users").updateOne({ _id: user._id }, { $set: { googleId, name: user.name || name } });
              user = await db.collection("users").findOne({ _id: user._id });
            }

            if (!user) return done(new Error("خطأ في إنشاء الحساب"));

            const sessionUser = {
              id: user._id.toString(),
              name: user.name,
              email: user.email || "",
              mobile: user.mobile || "",
              role: user.role || "user",
              isPublicDonor: !!user.isPublicDonor,
            } as unknown as User;
            return done(null, sessionUser);
          } catch (err) {
            return done(err as Error);
          }
        }
      )
    );
  }

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: any, done) => {
    try {
      const user = await storage.getUser(String(id));
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // ==================== AUTH ROUTES ====================

  // ── Google OAuth Redirect flow ──
  app.get("/api/auth/google", (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect("/?error=google_not_configured");
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login?error=google_failed", session: true }),
    (req, res) => {
      // Successful authentication — redirect based on role
      const user = req.user as any;
      const role = user?.role || "user";
      if (role === "admin" || role === "manager") return res.redirect("/admin");
      if (role === "delivery") return res.redirect("/delivery");
      if (["employee", "accountant", "programmer", "sales"].includes(role)) return res.redirect("/employee");
      res.redirect("/");
    }
  );

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
      if (!checkResetRateLimit(ip)) {
        return res.status(429).json({ message: "تجاوزت الحد المسموح به من المحاولات. حاول مرة أخرى بعد 15 دقيقة." });
      }
      const { mobile, newPassword } = req.body;
      if (!mobile || !newPassword) {
        return res.status(400).json({ message: "رقم الجوال وكلمة المرور الجديدة مطلوبان" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }
      const user = await storage.getUserByMobile(mobile);
      if (!user) {
        // Return generic message to prevent user enumeration
        return res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
      }
      const hashedPassword = await hashPassword(newPassword);
      await usersCollection.updateOne(
        { _id: new ObjectId(String(user.id)) },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );
      res.json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (err) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });


  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      if (!input.mobile || !input.password) {
        return res.status(400).json({ message: "رقم الجوال وكلمة المرور مطلوبة" });
      }
      const existingMobile = await storage.getUserByMobile(input.mobile as string);
      if (existingMobile) {
        return res.status(400).json({ message: "رقم الجوال مسجل مسبقاً" });
      }
      if (input.email) {
        const existingEmail = await usersCollection.findOne({ email: input.email });
        if (existingEmail) {
          return res.status(400).json({ message: "البريد الإلكتروني مسجل مسبقاً" });
        }
      }
      const hashedPassword = await hashPassword(input.password as string);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      
      // Send welcome email
      if (user.email) {
        const template = emailTemplates.welcome(user.name);
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html
        });
      }

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "فشل تسجيل الدخول" });
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "خطأ في الخادم" });
      }
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "فشل تسجيل الخروج" });
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // ==================== USER ROUTES ====================
  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { name, email } = req.body;
      const userId = (req.user as any).id;
      
      await usersCollection.updateOne(
        { _id: new ObjectId(String(userId)) },
        { $set: { name, email, updatedAt: new Date() } }
      );
      
      const updatedUser = await storage.getUser(userId);
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الملف الشخصي" });
    }
  });

  // ── Update mobile number (for Google users linking phone) ──
  app.patch("/api/user/update-mobile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { mobile } = req.body;
      if (!mobile || typeof mobile !== "string") return res.status(400).json({ message: "رقم الجوال مطلوب" });

      let clean = mobile.trim().replace(/\s/g, "");
      if (clean.startsWith("+966")) clean = clean.slice(4);
      if (clean.startsWith("966")) clean = clean.slice(3);
      if (clean.startsWith("0")) clean = clean.slice(1);
      if (!/^\d{9}$/.test(clean)) return res.status(400).json({ message: "رقم الجوال غير صحيح (9 أرقام بعد كود الدولة)" });

      const existing = await storage.getUserByMobile(clean);
      const userId = (req.user as any).id;
      if (existing && existing.id !== userId) return res.status(409).json({ message: "رقم الجوال مسجّل لحساب آخر" });

      await usersCollection.updateOne(
        { _id: new ObjectId(String(userId)) },
        { $set: { mobile: clean, updatedAt: new Date() } }
      );
      const updated = await storage.getUser(userId);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الجوال" });
    }
  });

  app.patch(api.users.togglePrivacy.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = api.users.togglePrivacy.input.parse(req.body);
    const user = await storage.updateUserPrivacy((req.user as any).id, input.isPublicDonor);
    res.json(user);
  });

  // ==================== DONATION ROUTES ====================
  app.post(api.donations.create.path, async (req, res) => {
    try {
      const { amount, type, donorName, paymentMethod, bankTransferPhoto } = req.body;
      const geideaRef = randomBytes(8).toString("hex");
      const userId = req.isAuthenticated() ? (req.user as any).id : undefined;
      const user = req.isAuthenticated() ? req.user as any : null;

      // Auto-fill donor name from user profile if available
      const finalDonorName = donorName || user?.name || "فاعل خير";

      const donation = await storage.createDonation({
        amount,
        type,
        donorName: finalDonorName,
        userId,
        geideaRef,
        paymentMethod: paymentMethod || "online",
        bankTransferPhoto: bankTransferPhoto || null,
        status: "pending"
      });

      // If bank transfer, don't redirect to payment gateway
      if (paymentMethod === "bank_transfer") {
        // Save bank details to user profile if they don't exist
        if (req.isAuthenticated() && req.body.bankName && req.body.iban) {
          await storage.updateBankDetails((req.user as any).id, req.body.bankName, req.body.iban);
        }

        // Send confirmation email
        if (user?.email) {
          const template = emailTemplates.donationReceived(finalDonorName, String(amount));
          await sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html
          });
        }

        return res.json({ 
          success: true, 
          message: "تم استلام طلب التبرع بنجاح، سيتم مراجعته قريباً",
          donationId: donation.id 
        });
      }

      // Determine which payment gateway to use
      const siteSettings = await db.collection("settings").findOne({});
      const appUrl = process.env.APP_URL || `https://${process.env.REPLIT_DEV_DOMAIN || "localhost:5000"}`;

      // Check if payment method is enabled in admin settings
      const enableRajhiPayment  = siteSettings?.enableRajhiPayment === true;   // default false
      const enableBankTransfer  = siteSettings?.enableBankTransfer !== false;   // default true

      const requestedGateway = req.body.gateway || "rajhi";
      const isTransferRequest = paymentMethod === "bank_transfer";

      if (isTransferRequest && !enableBankTransfer) {
        return res.status(403).json({ message: "التحويل البنكي غير متاح حالياً", code: "METHOD_DISABLED" });
      }
      if (requestedGateway === "rajhi" && !enableRajhiPayment) {
        return res.status(403).json({ message: "الدفع عبر الراجحي غير متاح حالياً", code: "METHOD_DISABLED" });
      }

      const gateway = requestedGateway;

      // --- Al Rajhi (Neoleap SecurePayments gateway) ---
      const tranportalId       = siteSettings?.rajhiTranportalId       || process.env.RAJHI_TRANPORTAL_ID;
      const tranportalPassword = siteSettings?.rajhiTranportalPassword || process.env.RAJHI_TRANPORTAL_PASSWORD;
      const resourceKey        = siteSettings?.rajhiResourceKey        || process.env.RAJHI_RESOURCE_KEY;

      if (!tranportalId || !tranportalPassword || !resourceKey) {
        const callbackUrl = `${appUrl}/api/donations/rajhi-callback?ref=${geideaRef}&Response=A&SimulatedHash=1`;
        return res.json({
          success: true,
          simulation: true,
          redirectUrl: callbackUrl,
          donationId: donation.id,
          message: "وضع المحاكاة — يرجى ضبط بيانات بوابة الدفع من الإعدادات",
        });
      }

      const approvalUrl = `${appUrl}/api/donations/rajhi-callback`;
      const errorUrl    = `${appUrl}/api/donations/rajhi-callback`;

      // Server-to-server JSON API call → gateway returns PaymentID → browser redirects to paymentpage.htm
      const payment = await initiateRajhiPayment({
        tranportalId,
        tranportalPassword,
        resourceKey,
        amountSAR: Number(amount),
        orderId: geideaRef,
        approvalUrl,
        errorUrl,
      });

      res.json({
        success: true,
        gateway: "al-rajhi",
        donationId: donation.id,
        redirectUrl: payment.redirectUrl,
        message: "جاري تحويلك إلى بوابة دفع مصرف الراجحي الآمنة...",
      });
    } catch (err: any) {
      console.error("Donation creation error:", err);
      res.status(500).json({ message: "خطأ في إنشاء التبرع" });
    }
  });

  // ---- Shared helper: confirm donation + emit certificate/invoice ----
  async function confirmDonationByRef(ref: string, paymentMethod = "online") {
    const donation = await storage.updateDonationStatus(ref, "confirmed");
    if (!donation) return null;

    if (donation.userId) {
      const user = await storage.getUser(String(donation.userId));
      if (user?.email) {
        const tpl = emailTemplates.donationReceived(donation.donorName || user.name || "فاعل خير", String(donation.amount));
        await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html });
      }
    }

    await db.collection("certificates").insertOne({
      _id: new ObjectId(),
      donationId: donation.id,
      userId: donation.userId ? new ObjectId(String(donation.userId)) : null,
      donorName: donation.donorName || "فاعل خير",
      amount: donation.amount,
      type: donation.type,
      certificateNumber: `TQ-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`,
      createdAt: new Date(),
    });

    await db.collection("invoices").insertOne({
      donationId: donation.id,
      userId: donation.userId ? new ObjectId(String(donation.userId)) : null,
      donorName: donation.donorName || "فاعل خير",
      amount: donation.amount,
      type: donation.type,
      paymentMethod,
      invoiceNumber: `INV-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`,
      createdAt: new Date(),
    });

    return donation;
  }

  // NOTE: Al Rajhi callback (POST/GET /api/donations/rajhi-callback) is handled by the
  // donations module (server/modules/donations/donations.controller.ts::handleRajhiCallback),
  // registered via app.use("/api/donations", donationsRoutes) in server/index.ts BEFORE
  // registerRoutes() is called. The module handler is the active one and includes full
  // side-effects (email, certificate, invoice, user stats).


  // ---- Legacy GET callback (kept for backward compat / simulation) ----
  app.get(api.donations.callback.path, async (req, res) => {
    const { ref, status } = req.query;
    if (typeof ref !== "string" || typeof status !== "string") {
      return res.status(400).send("طلب غير صالح");
    }
    if (status === "success") {
      await confirmDonationByRef(ref, "online");
      res.redirect(`/payment-result?status=success&id=${ref}`);
    } else {
      await storage.updateDonationStatus(ref, "failed");
      res.redirect(`/payment-result?status=failed&id=${ref}`);
    }
  });

  app.get(api.donations.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const donations = await storage.getDonations((req.user as any).id);
      res.json(Array.isArray(donations) ? donations : []);
    } catch {
      res.json([]);
    }
  });

  // ==================== CERTIFICATES ROUTES ====================
  app.get("/api/certificates", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = (req.user as any).id;
      const certs = await db.collection("certificates")
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray();
      res.json(certs.map((c: any) => ({ ...c, id: c._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الشهادات" });
    }
  });

  app.get("/api/certificates/:id", async (req, res) => {
    try {
      const cert = await db.collection("certificates").findOne({ _id: new ObjectId(String(req.params.id)) });
      if (!cert) return res.status(404).json({ message: "الشهادة غير موجودة" });
      res.json({ ...cert, id: cert._id.toString() });
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الشهادة" });
    }
  });


  // ==================== CAMPAIGNS ROUTES ====================
  const DEFAULT_CAMPAIGNS = [
    { id: "water", title: "سقياء ماء", subtitle: "قال رسول الله ﷺ: «أفضل الصدقة سقى الماء»", image: "/images/campaign-water.png", color: "from-cyan-500 to-teal-600", badge: "جارية", badgeColor: "bg-cyan-100 text-cyan-800", isActive: true, sortOrder: 1, tiers: [{ label: "سهم الفرد", amount: "50 ريال" }, { label: "سهم الوالدين", amount: "100 ريال" }, { label: "شهر كامل", amount: "1,500 ريال" }] },
    { id: "basket", title: "السلة الرمضانية", subtitle: "قال رسول الله ﷺ: «اتقوا النار ولو بشق تمرة»", image: "/images/campaign-basket.png", color: "from-emerald-500 to-green-700", badge: "رمضان", badgeColor: "bg-emerald-100 text-emerald-800", isActive: true, sortOrder: 2, tiers: [{ label: "مبلغ مفتوح", amount: "حسب طاقتك" }, { label: "سهم الفرد", amount: "150 ريال" }, { label: "سهم الوالدين", amount: "300 ريال" }] },
    { id: "iftar", title: "إفطار الصائمين", subtitle: "قال رسول الله ﷺ: «من فطّر صائماً كان له مثل أجره»", image: "/images/campaign-iftar.png", color: "from-amber-500 to-orange-600", badge: "فرصة", badgeColor: "bg-amber-100 text-amber-800", isActive: true, sortOrder: 3, tiers: [{ label: "وجبة واحدة", amount: "15 ريال" }, { label: "شهر كامل", amount: "450 ريال" }, { label: "الهدف", amount: "60,000 وجبة" }] },
  ];

  app.get("/api/campaigns", async (req, res) => {
    try {
      const cached = getCache("campaigns");
      if (cached) return res.json(cached);
      const campaigns = await db.collection("campaigns").find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).toArray();
      const data = campaigns.length === 0 ? DEFAULT_CAMPAIGNS : campaigns.map((c: any) => ({ ...c, id: c._id.toString(), _id: undefined }));
      setCache("campaigns", data, 120_000);
      res.json(data);
    } catch (err) {
      res.json(DEFAULT_CAMPAIGNS);
    }
  });

  app.get("/api/admin/campaigns", requireRole("admin", "manager"), async (req, res) => {
    try {
      const campaigns = await db.collection("campaigns").find({}).sort({ sortOrder: 1, createdAt: 1 }).toArray();
      res.json(campaigns.map((c: any) => ({ ...c, id: c._id.toString(), _id: undefined })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الحملات" });
    }
  });

  app.post("/api/admin/campaigns", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { title, subtitle, image, color, badge, badgeColor, isActive, sortOrder, tiers } = req.body;
      if (!title) return res.status(400).json({ message: "العنوان مطلوب" });
      const campaign = { title, subtitle: subtitle || "", image: image || "", color: color || "from-primary to-teal-600", badge: badge || "جارية", badgeColor: badgeColor || "bg-primary/10 text-primary", isActive: isActive ?? true, sortOrder: sortOrder ? Number(sortOrder) : 99, tiers: tiers || [], createdAt: new Date() };
      const result = await db.collection("campaigns").insertOne(campaign);
      res.json({ ...campaign, id: result.insertedId.toString() });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إنشاء الحملة" });
    }
  });

  app.put("/api/admin/campaigns/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { title, subtitle, image, color, badge, badgeColor, isActive, sortOrder, tiers } = req.body;
      await db.collection("campaigns").updateOne(
        { _id: new ObjectId(String(req.params.id)) },
        { $set: { title, subtitle, image, color, badge, badgeColor, isActive, sortOrder: Number(sortOrder) || 99, tiers, updatedAt: new Date() } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الحملة" });
    }
  });

  app.patch("/api/admin/campaigns/:id/active", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { isActive } = req.body;
      await db.collection("campaigns").updateOne({ _id: new ObjectId(String(req.params.id)) }, { $set: { isActive, updatedAt: new Date() } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الحملة" });
    }
  });

  app.delete("/api/admin/campaigns/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      await db.collection("campaigns").deleteOne({ _id: new ObjectId(String(req.params.id)) });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف الحملة" });
    }
  });

  // ==================== ADMIN DONATIONS MANAGEMENT ====================
  app.get("/api/admin/donations", requireRole("admin", "manager", "accountant"), async (req, res) => {
    try {
      const { status, type, from, to, search, limit: lim } = req.query as any;
      const filter: any = { isDeleted: { $ne: true } };
      if (status && status !== "all") filter.status = status;
      if (type && type !== "all") filter.type = type;
      if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(from);
        if (to) { const t = new Date(to); t.setHours(23,59,59); filter.createdAt.$lte = t; }
      }
      if (search) {
        filter.$or = [
          { donorName: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      const donations = await db.collection("donations")
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(lim ? Number(lim) : 500)
        .toArray();
      res.json(donations.map((d: any) => ({ ...d, id: d._id.toString(), _id: undefined })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب التبرعات" });
    }
  });

  app.patch("/api/admin/donations/:id", requireRole("admin", "manager", "accountant"), async (req, res) => {
    try {
      const { status, notes, adminNote } = req.body;
      const id = String(req.params.id);

      // When admin confirms a donation, use the full service (triggers email, certificate, invoice, user stats)
      if (status === "success" || status === "confirmed") {
        try {
          await confirmDonationStatus({ _id: id }, "confirmed");
        } catch (svcErr) {
          console.error("[Admin Donations] confirmDonationStatus failed:", (svcErr as Error).message);
        }
      }

      // Also apply any additional fields (notes, adminNote) and normalize status
      const updateFields: any = { updatedAt: new Date() };
      if (status) updateFields.status = status === "confirmed" ? "confirmed" : status;
      if (notes !== undefined) updateFields.notes = notes;
      if (adminNote !== undefined) updateFields.adminNote = adminNote;
      await db.collection("donations").updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث التبرع" });
    }
  });

  app.delete("/api/admin/donations/:id", requireRole("admin"), async (req, res) => {
    try {
      await db.collection("donations").deleteOne({ _id: new ObjectId(String(req.params.id)) });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف التبرع" });
    }
  });

  app.get("/api/admin/donations/export", requireRole("admin", "manager", "accountant"), async (req, res) => {
    try {
      const donations = await db.collection("donations").find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).toArray();
      const STATUS_AR: any = { success: "مؤكد", pending: "معلق", rejected: "مرفوض", failed: "فاشل", confirmed: "مؤكد" };
      const TYPE_AR: any = { general: "صدقة عامة", zakat: "زكاة", waqf: "وقف", kafara: "كفارة", hajj: "كفالة حاج", families: "كفالة أسر أرامل ومطلقات", orphan: "كفالة يتيم", relief: "تفريج كربة", water: "سقيا الماء", food: "إطعام", ramadan: "سلة رمضانية" };
      const METHOD_AR: any = { online: "دفع إلكتروني", bank_transfer: "تحويل بنكي", cash: "نقدي" };
      const rows = [
        ["الرقم", "المتبرع", "الجوال", "البريد", "المبلغ", "النوع", "طريقة الدفع", "الحالة", "ملاحظات", "التاريخ"],
        ...donations.map((d: any, i: number) => [
          i + 1,
          d.donorName || "فاعل خير",
          d.mobile || "",
          d.email || "",
          d.amount,
          TYPE_AR[d.type] || d.type || "",
          METHOD_AR[d.paymentMethod] || d.paymentMethod || "",
          STATUS_AR[d.status] || d.status || "",
          d.adminNote || d.notes || "",
          d.createdAt ? new Date(d.createdAt).toLocaleDateString("ar-SA") : "",
        ]),
      ];
      const csv = rows.map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      const bom = "\uFEFF";
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="donations-${Date.now()}.csv"`);
      res.send(bom + csv);
    } catch (err) {
      res.status(500).json({ message: "خطأ في تصدير التبرعات" });
    }
  });

  // ==================== BANK TRANSFER ROUTES ====================
  app.post("/api/bank-transfers", upload.single("file"), async (req, res) => {
    try {
      const { amount, type, bankName, transferDate, donorName, donorPhone, donorEmail } = req.body;
      const receiptImage = req.file ? `/uploads/${req.file.filename}` : req.body.receiptImage;
      
      const transfer = await db.collection("bank_transfers").insertOne({
        amount,
        type,
        bankName,
        transferDate,
        receiptImage,
        donorName,
        donorPhone,
        donorEmail: donorEmail || null,
        userId: req.isAuthenticated() ? new ObjectId((req.user as any).id) : null,
        status: "pending",
        createdAt: new Date()
      });
      
      res.status(201).json({ id: transfer.insertedId, message: "تم استلام إيصال التحويل بنجاح" });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حفظ إيصال التحويل" });
    }
  });

  app.get("/api/bank-transfers", requireRole("admin", "accountant", "manager"), async (req, res) => {
    try {
      const transfers = await db.collection("bank_transfers")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.json(transfers.map((t: any) => ({ ...t, id: t._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب التحويلات" });
    }
  });

  app.patch("/api/bank-transfers/:id", requireRole("admin", "accountant", "manager"), async (req, res) => {
    try {
      const { status, notes } = req.body;
      const transferId = String(req.params.id);
      
      // First, get the current transfer state
      const existingTransfer = await db.collection("bank_transfers").findOne({ _id: new ObjectId(transferId) });
      
      if (!existingTransfer) {
        return res.status(404).json({ message: "التحويل غير موجود" });
      }

      // Prevent processing if already approved
      if (existingTransfer.status === "approved" && status === "approved") {
        return res.status(400).json({ message: "هذا الطلب تمت الموافقة عليه مسبقاً" });
      }
      
      const updateResult = await db.collection("bank_transfers").findOneAndUpdate(
        { _id: new ObjectId(transferId) },
        { $set: { status, notes, reviewedBy: (req.user as any).id, reviewedAt: new Date() } },
        { returnDocument: 'after' }
      );

      if (status === "approved") {
        const transfer = updateResult;
        if (transfer) {
          const geideaRef = `BANK-${randomBytes(8).toString("hex")}`;
          // Use confirmed status immediately
          const donation = await storage.createDonation({
            amount: transfer.amount,
            type: transfer.type,
            userId: transfer.userId ? String(transfer.userId) : null,
            donorName: transfer.donorName || null,
            geideaRef,
            status: "confirmed",
            paymentMethod: "bank_transfer",
          });
          
          // Create Certificate
          await db.collection("certificates").insertOne({
            donationId: donation.id,
            userId: transfer.userId ? new ObjectId(String(transfer.userId)) : null,
            donorName: transfer.donorName || "فاعل خير",
            amount: transfer.amount,
            type: transfer.type,
            certificateNumber: `TQ-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`,
            createdAt: new Date()
          });

          // Create Invoice
          await db.collection("invoices").insertOne({
            donationId: donation.id,
            userId: transfer.userId ? new ObjectId(String(transfer.userId)) : null,
            donorName: transfer.donorName || "فاعل خير",
            donorPhone: transfer.donorPhone || "",
            amount: transfer.amount,
            type: transfer.type,
            paymentMethod: "bank_transfer",
            transferId: new ObjectId(transferId),
            invoiceNumber: `INV-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`,
            createdAt: new Date()
          });

          // updateDonationStatus handles user totals and points if confirmed
          await storage.updateDonationStatus(geideaRef, "confirmed");

          // Send confirmation email with invoice and certificate via SMTP2GO
          if (transfer.donorEmail || (transfer.userId && (await storage.getUser(transfer.userId))?.email)) {
            const email = transfer.donorEmail || (await storage.getUser(transfer.userId))?.email;
            await sendEmail({
              to: email,
              subject: "تم تأكيد تبرعكم - منصة طويق",
              html: `<h3>تم تأكيد تبرعكم بنجاح</h3><p>شكراً لكم على تبرعكم بمبلغ <strong>${transfer.amount}</strong> ريال سعودي. تم تحديث نقاطكم في المنصة.</p>`
            });
          }
        }
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error("Error updating bank transfer:", err);
      res.status(500).json({ message: "خطأ في تحديث التحويل" });
    }
  });

  app.post("/api/bank-transfers/:id/send-receipt", async (req: Request, res: Response) => {
    try {
      const transferId = req.params.id;
      const { email, donorName: reqDonorName } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "يرجى إدخال بريد إلكتروني صحيح" });
      }
      const transfer = await db.collection("bank_transfers").findOne({ _id: new ObjectId(String(transferId)) });
      if (!transfer) return res.status(404).json({ message: "الطلب غير موجود" });

      const donorName = reqDonorName || transfer.donorName || "فاعل خير";
      const amount = transfer.amount || 0;
      const type = transfer.type || "general";
      const TYPE_LABELS: Record<string, string> = {
        general: "صدقة عامة", zakat: "زكاة مال", waqf: "وقف",
        hajj: "كفالة حاج", families: "كفالة أسر أرامل ومطلقات",
        orphan: "كفالة يتيم", relief: "تفريج كربة",
      };
      const typeLabel = TYPE_LABELS[type] || type;
      const dateStr = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
      const amountFmt = `${Number(amount).toLocaleString("ar-SA")} ريال سعودي`;
      const receiptNum = `TQ-BT-${Date.now().toString().slice(-8)}`;

      const htmlBody = `
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:#f0fdf4;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">✅</div>
          <h2 style="color:#059669;margin:12px 0 4px;font-size:22px;">تم استلام طلب التحويل</h2>
          <p style="color:#64748b;margin:0;font-size:14px;">سيتم مراجعة إيصالكم خلال 24 ساعة</p>
        </div>
        <p>السادة / <strong>${donorName}</strong>،</p>
        <p>السلام عليكم ورحمة الله وبركاته،</p>
        <p>يسعد <strong>جمعية طويق للخدمات الإنسانية</strong> إخباركم بأنه تم استلام طلب تحويلكم الكريم. جزاكم الله خيراً وبارك في مالكم.</p>
        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:24px 0;border:1px solid #e2e8f0;">
          <h3 style="color:#1e293b;margin:0 0 16px;font-size:16px;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">تفاصيل طلب التحويل</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">رقم الطلب</td><td style="padding:8px 0;font-weight:700;text-align:left;font-family:monospace;">${receiptNum}</td></tr>
            <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">مبلغ التبرع</td><td style="padding:8px 0;font-weight:700;color:#059669;text-align:left;font-size:16px;">${amountFmt}</td></tr>
            <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">نوع التبرع</td><td style="padding:8px 0;font-weight:700;text-align:left;">${typeLabel}</td></tr>
            <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;color:#64748b;font-size:14px;">التاريخ</td><td style="padding:8px 0;font-weight:700;text-align:left;">${dateStr}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">الحالة</td><td style="padding:8px 0;"><span style="background:#fef9c3;color:#854d0e;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700;">قيد المراجعة</span></td></tr>
          </table>
        </div>
        <div style="background:#fffbeb;border-radius:12px;padding:16px;margin:16px 0;border-right:4px solid #f59e0b;">
          <p style="margin:0;color:#92400e;font-size:13px;">سيتم إرسال شهادة التبرع الرسمية بعد التحقق من التحويل خلال 24 ساعة.</p>
        </div>
        <p>وفقكم الله وتقبّل منكم صالح الأعمال.</p>
      `;

      const result = await sendEmail({
        to: email,
        subject: `إيصال استلام تحويل — ${typeLabel} | جمعية طويق`,
        html: htmlBody,
      });

      if (result.success) {
        res.json({ success: true, message: "تم إرسال إيصال الاستلام إلى بريدكم الإلكتروني" });
      } else {
        res.status(500).json({ message: "فشل إرسال البريد، يرجى المحاولة لاحقاً" });
      }
    } catch (err) {
      console.error("Error sending bank transfer receipt:", err);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.delete("/api/bank-transfers/:id", requireRole("admin"), async (req, res) => {
    try {
      await db.collection("bank_transfers").deleteOne({ _id: new ObjectId(String(req.params.id)) });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف التحويل" });
    }
  });

  app.get("/api/bank-transfers/export", requireRole("admin", "manager", "accountant"), async (req, res) => {
    try {
      const transfers = await db.collection("bank_transfers").find({}).sort({ createdAt: -1 }).toArray();
      const STATUS_AR: any = { pending: "معلق", approved: "مقبول", rejected: "مرفوض" };
      const rows = [
        ["الرقم", "المتبرع", "الجوال", "البريد", "المبلغ", "البنك", "تاريخ التحويل", "الحالة", "ملاحظات", "التاريخ"],
        ...transfers.map((t: any, i: number) => [
          i + 1,
          t.donorName || "فاعل خير",
          t.donorPhone || "",
          t.donorEmail || "",
          t.amount || "",
          t.bankName || "",
          t.transferDate || "",
          STATUS_AR[t.status] || t.status || "",
          t.notes || "",
          t.createdAt ? new Date(t.createdAt).toLocaleDateString("ar-SA") : "",
        ]),
      ];
      const csv = rows.map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      const bom = "\uFEFF";
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="bank-transfers-${Date.now()}.csv"`);
      res.send(bom + csv);
    } catch (err) {
      res.status(500).json({ message: "خطأ في تصدير التحويلات" });
    }
  });

  // ==================== ADMIN EMAIL ROUTES ====================
  app.post("/api/admin/send-email", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { to, subject, message } = req.body;
      if (!to || !subject || !message) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }

      console.log(`Attempting to send admin email to: ${to}`);
      const result = await sendEmail({
        to,
        subject,
        html: `<div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">${message}</div>`
      });

      if (result.success) {
        res.json({ message: "تم إرسال البريد بنجاح", messageId: result.messageId });
      } else {
        console.error("Admin email sending failed:", result.error);
        res.status(500).json({ message: "فشل إرسال البريد", error: String(result.error) });
      }
    } catch (err) {
      console.error("Admin email route error:", err);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Test email endpoint
  app.post("/api/admin/test-email", requireRole("admin"), async (req, res) => {
    try {
      const { to } = req.body;
      const target = to || (req.user as any)?.email;
      if (!target) {
        return res.status(400).json({ message: "يرجى تحديد البريد الإلكتروني للاختبار" });
      }
      const result = await sendEmail({
        to: target,
        subject: "اختبار نظام البريد الإلكتروني - جمعية طويق",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="background: #059669; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">جمعية طويق</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
              <h2 style="color: #059669;">✓ نظام البريد يعمل بشكل صحيح</h2>
              <p>هذه رسالة اختبار للتأكد من أن نظام البريد الإلكتروني يعمل بشكل سليم.</p>
              <p>تم الإرسال بنجاح في: <strong>${new Date().toLocaleString('ar-SA')}</strong></p>
            </div>
          </div>
        `,
      });
      if (result.success) {
        res.json({ message: `تم إرسال بريد الاختبار إلى ${target} بنجاح`, messageId: result.messageId });
      } else {
        res.status(500).json({ message: "فشل إرسال بريد الاختبار", error: String(result.error) });
      }
    } catch (err: any) {
      res.status(500).json({ message: "خطأ في الخادم", error: err.message });
    }
  });

  // ==================== CONTENT MANAGEMENT ====================
  app.get("/api/admin/content", async (req, res) => {
    try {
      const content = await storage.getAllContent();
      res.json(content);
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب المحتوى" });
    }
  });

  // ── News CRUD ───────────────────────────────────────────────────────────────
  // Public: GET /api/news — list published news (admins get all with ?all=1)
  app.get("/api/news", async (req, res) => {
    try {
      const isAdmin = req.isAuthenticated && req.isAuthenticated() && ["admin", "manager", "editor"].includes((req.user as any)?.role);
      const showAll = isAdmin && req.query.all === "1";
      const cacheKey = showAll ? "news_all" : "news_public";
      const cached = getCache(cacheKey);
      if (cached) return res.json(cached);

      const query = showAll ? {} : { isPublished: { $ne: false } };
      const newsDocs = await db.collection("news")
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      const news = newsDocs.map((n: any) => ({
        id: n._id?.toString(),
        _id: n._id?.toString(),
        slug: n.slug || "",
        title: n.title || "",
        titleEn: n.titleEn || "",
        summary: n.summary || "",
        summaryEn: n.summaryEn || "",
        content: showAll ? (n.content || "") : (n.content || "").slice(0, 300),
        contentEn: showAll ? (n.contentEn || "") : "",
        imageUrl: n.imageUrl || "",
        category: n.category || "general",
        isPublished: n.isPublished !== false,
        createdAt: n.createdAt || null,
        updatedAt: n.updatedAt || null,
      }));

      setCache(cacheKey, news, showAll ? 30_000 : 120_000);
      res.json(news);
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الأخبار" });
    }
  });

  // Public: GET /api/news/:id — single article by id or slug
  app.get("/api/news/:id", async (req, res) => {
    try {
      const { ObjectId } = await import("mongodb");
      const param = req.params.id;
      let doc: any = null;
      try { doc = await db.collection("news").findOne({ _id: new ObjectId(param) }); } catch {}
      if (!doc) doc = await db.collection("news").findOne({ slug: param });
      if (!doc || doc.isPublished === false) return res.status(404).json({ message: "الخبر غير موجود" });
      res.json({
        id: doc._id?.toString(), _id: doc._id?.toString(),
        slug: doc.slug || "", title: doc.title || "", titleEn: doc.titleEn || "",
        summary: doc.summary || "", summaryEn: doc.summaryEn || "",
        content: doc.content || "", contentEn: doc.contentEn || "",
        imageUrl: doc.imageUrl || "", category: doc.category || "general",
        isPublished: doc.isPublished !== false,
        createdAt: doc.createdAt || null, updatedAt: doc.updatedAt || null,
      });
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الخبر" });
    }
  });

  // Admin: POST /api/news — create news article
  app.post("/api/news", requireRole("admin", "manager", "editor"), async (req, res) => {
    try {
      const doc = {
        ...req.body,
        isPublished: req.body.isPublished ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await db.collection("news").insertOne(doc);
      invalidateCache("news_public");
      invalidateCache("news_all");
      res.status(201).json({ id: result.insertedId?.toString(), _id: result.insertedId?.toString() });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إضافة الخبر" });
    }
  });

  // Admin: PUT /api/news/:id — update news article
  app.put("/api/news/:id", requireRole("admin", "manager", "editor"), async (req, res) => {
    try {
      const { ObjectId } = await import("mongodb");
      await db.collection("news").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { ...req.body, updatedAt: new Date() } }
      );
      invalidateCache("news_public");
      invalidateCache("news_all");
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الخبر" });
    }
  });

  // Admin: PATCH /api/news/:id/publish — toggle published state
  app.patch("/api/news/:id/publish", requireRole("admin", "manager", "editor"), async (req, res) => {
    try {
      const { ObjectId } = await import("mongodb");
      const { isPublished } = req.body;
      await db.collection("news").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { isPublished: !!isPublished, updatedAt: new Date() } }
      );
      invalidateCache("news_public");
      invalidateCache("news_all");
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث حالة النشر" });
    }
  });

  // Admin: DELETE /api/news/:id — delete news article
  app.delete("/api/news/:id", requireRole("admin", "manager", "editor"), async (req, res) => {
    try {
      const { ObjectId } = await import("mongodb");
      await db.collection("news").deleteOne({ _id: new ObjectId(req.params.id) });
      invalidateCache("news_public");
      invalidateCache("news_all");
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف الخبر" });
    }
  });

  app.get("/api/content/:slug", async (req, res) => {
    try {
      const content = await storage.getContent(req.params.slug);
      if (!content) {
        return res.json({ slug: req.params.slug, title: "", content: "" });
      }
      res.json(content);
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب المحتوى" });
    }
  });

  app.put("/api/admin/content/:slug", requireRole("admin", "manager"), async (req, res) => {
    try {
      const slug = String(req.params.slug);
      const content = await storage.updateContent(slug, req.body);
      res.json(content);
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث المحتوى" });
    }
  });

  app.post("/api/admin/content", requireRole("admin", "manager"), async (req, res) => {
    try {
      // For MongoDB content collection
      const result = await db.collection("content").insertOne({
        ...req.body,
        createdAt: new Date()
      });
      res.status(201).json({ id: result.insertedId });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إضافة المحتوى" });
    }
  });

  app.delete("/api/admin/content/:slug", requireRole("admin", "manager"), async (req, res) => {
    try {
      const slug = String(req.params.slug);
      await db.collection("content").deleteOne({ slug });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف المحتوى" });
    }
  });

  // ==================== SEED DEFAULT CONTENT ====================
  app.post("/api/admin/seed-content", requireRole("admin"), async (req, res) => {
    try {
      const defaultContent = [
        {
          slug: "home-hero",
          title: "بصمتكم تصنع الفرق",
          titleEn: "Your Impact Makes a Difference",
          content: "جمعية طويق للخدمات الإنسانية — شريككم في رحلة العطاء والإنسانية",
          imageUrl: "",
          videoUrl: "",
          metaDescription: "جمعية طويق للخدمات الإنسانية — تبرع الآن وكن جزءاً من مجتمع متكافل",
        },
        {
          slug: "about",
          title: "نشأة جمعية طويق للخدمات الإنسانية",
          titleEn: "About Tuwaiq Humanitarian Services Association",
          content: `<p>جمعية طويق للخدمات الإنسانية جمعية أهلية سعودية تأسست بهدف تقديم الدعم والرعاية للفئات المحتاجة والعمل على تعزيز التكافل الاجتماعي وخدمة المجتمع.</p><p>تأسست الجمعية وفقاً لنظام الجمعيات والمؤسسات الأهلية الصادر بالمرسوم الملكي رقم (م/8) وتاريخ 1437/02/19هـ ولائحته التنفيذية، وحصلت على رقم سجل <strong>1000820300</strong> وترخيص رقم <strong>6573</strong>.</p><p>ومنذ انطلاقتها، كرّست الجمعية جهودها لتنفيذ برامج ومبادرات إنسانية متنوعة تسهم في تحسين جودة حياة المستفيدين وتقديم المساعدات للأسر المحتاجة ضمن إطار رسالتها الخيرية المباركة.</p>`,
          metaDescription: "تعرف على جمعية طويق للخدمات الإنسانية — رقم السجل 1000820300 | ترخيص 6573",
        },
        {
          slug: "goals",
          title: "أهداف جمعية طويق",
          titleEn: "Tuwaiq Association Goals",
          content: `<ul><li>الارتقاء بالمستوى المعيشي للمستفيدين وتحسين جودة حياتهم</li><li>ترسيخ مبدأ التكافل الاجتماعي بين أفراد المجتمع</li><li>تدريب أبناء المستفيدين وتأهيلهم لسوق العمل</li><li>تقديم المساعدات العينية والمالية لكافة الفئات المحتاجة</li><li>توفير المياه النظيفة من خلال مشاريع سقياء</li><li>توزيع السلال الغذائية وإفطار الصائمين</li><li>دعم الحالات الإنسانية الطارئة والخاصة</li></ul>`,
          metaDescription: "أهداف جمعية طويق للخدمات الإنسانية",
        },
        {
          slug: "vision",
          title: "الرؤية والرسالة والقيم",
          titleEn: "Vision, Mission & Values",
          content: `<h2>رؤيتنا</h2><p>الريادة في العمل الخيري والإنساني بالمملكة العربية السعودية.</p><h2>رسالتنا</h2><p>تقديم الدعم والمساعدة للفئات المحتاجة من خلال برامج مستدامة تحقق التكافل الاجتماعي.</p><h2>قيمنا</h2><ul><li><strong>الأمانة:</strong> نضمن وصول التبرعات لمستحقيها</li><li><strong>الشفافية:</strong> نعمل بوضوح تام في جميع عملياتنا</li><li><strong>التكافل:</strong> نؤمن بأهمية التعاون المجتمعي</li><li><strong>المسؤولية:</strong> نتحمل مسؤولية خدمة المجتمع بإخلاص</li></ul>`,
          metaDescription: "رؤية ورسالة وقيم جمعية طويق للخدمات الإنسانية",
        },
        {
          slug: "board",
          title: "أعضاء مجلس الإدارة",
          titleEn: "Board of Directors",
          content: `<h2>مجلس إدارة جمعية طويق</h2><ul><li>عبدالله أحمد علي حكمي — رئيس مجلس الإدارة</li><li>حسن زاهر أحمد علي حكمي — نائب الرئيس</li><li>عبدالواهاب إبراهيم عبدالله علي حكمي — أمين الصندوق</li><li>محمد سعد محمد أحمد حكمي — عضو</li><li>محمد سعد محمد جمال حكمي — عضو</li></ul><p>مدة الدورة الإدارية: 4 سنوات.</p>`,
          metaDescription: "أعضاء مجلس إدارة جمعية طويق للخدمات الإنسانية",
        },
        {
          slug: "founders",
          title: "الأعضاء المؤسسون",
          titleEn: "Founding Members",
          content: `<p>تفتخر جمعية طويق بنخبة من الأعضاء المؤسسين الذين أسهموا في تأسيس الجمعية ودعم مسيرتها.</p><h3>الأعضاء الأوائل — حفظهم الله</h3><ul><li>عبدالله أحمد علي حكمي</li><li>حسن زاهر أحمد علي حكمي</li><li>عبدالواهاب إبراهيم عبدالله علي حكمي</li><li>محمد سعد محمد أحمد حكمي</li><li>محمد سعد محمد جمال حكمي</li><li>نورة سعد محمد القحطاني</li><li>محمد إبراهيم محمد حكمي</li><li>محمد أحمد صالح أحمد حكمي</li><li>بدر عبدالله يحيى علي مري</li><li>حسام الدين عثمان علي جمال حكمي</li><li>إبراهيم عثمان علي حكمي</li><li>عبدالله عبدالله صالح حكمي</li><li>ناصر عبدالله عبدالعزيز آل زعلة</li></ul>`,
          metaDescription: "الأعضاء المؤسسون لجمعية طويق للخدمات الإنسانية",
        },
        {
          slug: "bylaws",
          title: "اللائحة الأساسية",
          titleEn: "Bylaws",
          content: `<h2>اللائحة الأساسية لجمعية طويق</h2><p>تأسست الجمعية وفقاً لنظام الجمعيات الأهلية الصادر بالمرسوم الملكي رقم (م/8) تاريخ 1437/02/19هـ.</p><h3>العضوية</h3><ul><li><strong>عضوية عادية:</strong> 100 ريال سنوياً</li><li><strong>عضوية داعمة:</strong> لا تقل عن 100,000 ريال</li></ul><h3>الحسابات البنكية</h3><ul><li><strong>مصرف الراجحي:</strong> SA3080 0005896080195679 23</li><li><strong>البنك العربي الوطني ANB:</strong> SA6930 4001809581039 0018</li><li><strong>بنك البلاد:</strong> SA2315 0009999146128000007</li></ul>`,
          metaDescription: "اللائحة الأساسية لجمعية طويق للخدمات الإنسانية",
        },
      ];

      let seeded = 0; let updated = 0;
      for (const item of defaultContent) {
        const existing = await db.collection("content").findOne({ slug: item.slug });
        if (existing) {
          await db.collection("content").updateOne({ slug: item.slug }, { $set: { ...item, updatedAt: new Date() } });
          updated++;
        } else {
          await db.collection("content").insertOne({ ...item, updatedAt: new Date() });
          seeded++;
        }
      }
      await db.collection("settings").updateOne({}, { $set: {
        associationName: "جمعية طويق للخدمات الإنسانية",
        associationNameEn: "Tuwaiq Humanitarian Services Association",
        registrationNumber: "1000820300",
        licenseNumber: "17660",
        phone: "+966505793012",
        twitter: "tuwaiq_2030",
        instagram: "tuwaiq_2030",
        bankAccounts: [
          { bank: "مصرف الراجحي", iban: "SA3080 0005896080195679 23" },
          { bank: "ANB البنك العربي الوطني", iban: "SA6930 4001809581039 0018" },
          { bank: "بنك البلاد", iban: "SA2315 0009999146128000007" },
        ],
      } }, { upsert: true });
      res.json({ success: true, message: `تم: ${seeded} جديدة، ${updated} محدّثة، وتحديث الإعدادات`, seeded, updated });
    } catch (err) {
      console.error("Seed error:", err);
      res.status(500).json({ message: "خطأ في ملء البيانات الافتراضية" });
    }
  });

  // ==================== JOBS MANAGEMENT ====================
  app.get("/api/jobs", async (req, res) => {
    try {
      const cached = getCache("jobs");
      if (cached) return res.json(cached);
      const jobs = await db.collection("jobs").find({}).sort({ createdAt: -1 }).toArray();
      const data = jobs.map((j: any) => ({ ...j, id: j._id.toString() }));
      setCache("jobs", data, 300_000);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الوظائف" });
    }
  });

  app.post("/api/jobs", requireRole("admin", "manager"), async (req, res) => {
    try {
      invalidateCache("jobs");
      const job = await storage.createJob(req.body);
      res.status(201).json(job);
    } catch (err) {
      res.status(500).json({ message: "خطأ في إنشاء الوظيفة" });
    }
  });

  app.put("/api/jobs/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      const jobId = String(req.params.id);
      await storage.updateJob(jobId, req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الوظيفة" });
    }
  });

  app.delete("/api/jobs/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      const jobId = String(req.params.id);
      await storage.deleteJob(jobId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف الوظيفة" });
    }
  });

  // ==================== JOB APPLICATIONS ====================
  app.get("/api/job-applications", requireRole("admin", "manager", "employee"), async (req, res) => {
    try {
      const applications = await storage.getJobApplications();
      res.json(applications);
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الطلبات" });
    }
  });

  app.post("/api/job-applications", upload.single("cv"), async (req, res) => {
    try {
      const cvUrl = req.file ? `/uploads/${req.file.filename}` : null;
      const data = {
        ...req.body,
        cvUrl,
        customAnswers: req.body.customAnswers ? JSON.parse(req.body.customAnswers) : []
      };
      const application = await storage.createJobApplication(data);
      res.status(201).json(application);

      // Send confirmation email to applicant (fire & forget — don't block response)
      const applicantEmail = req.body.email;
      const applicantName  = req.body.name  || "المتقدم";
      const jobTitle       = req.body.jobTitle || "الوظيفة";

      if (applicantEmail) {
        // Fetch job department if jobId provided
        let department: string | undefined;
        if (req.body.jobId) {
          try {
            const job = await db.collection("jobs").findOne({ _id: new ObjectId(String(req.body.jobId)) });
            department = job?.department;
          } catch (_) {}
        }

        const tpl = emailTemplates.jobApplicationReceived(applicantName, jobTitle, department);
        sendEmail({ to: applicantEmail, subject: tpl.subject, html: tpl.html })
          .then(result => {
            if (result.success) console.log(`[Mail] ✓ Job application confirmation sent to ${applicantEmail}`);
            else console.error(`[Mail] ✗ Failed to send job application confirmation: ${result.error}`);
          })
          .catch(err => console.error("[Mail] Job application email error:", err));
      }
    } catch (err) {
      console.error("Job application error:", err);
      res.status(500).json({ message: "حدث خطأ أثناء تقديم الطلب" });
    }
  });

  app.patch("/api/job-applications/:id/status", requireRole("admin", "manager", "employee"), async (req, res) => {
    try {
      const { status, notes, role } = req.body;
      const applicationId = String(req.params.id);
      await storage.updateJobApplicationStatus(applicationId, status, notes);

      // When approved: create employee account and send setup email
      if (status === "approved") {
        const app = await db.collection("job_applications").findOne({ _id: new ObjectId(applicationId) });
        if (app && app.email) {
          // Check if user already exists
          const existing = await usersCollection.findOne({ email: app.email });
          if (!existing) {
            // Generate employee ID
            const empCount = await usersCollection.countDocuments({ role: { $nin: ["user", "admin"] } });
            const employeeId = `TQ-${String(empCount + 1).padStart(4, "0")}`;
            // Generate setup token
            const setupToken = randomBytes(32).toString("hex");
            const setupTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
            const tempPassword = await hashPassword(randomBytes(12).toString("hex"));
            const empRole = role || "employee";
            // Normalize phone: strip +966/0 prefix and spaces for consistent login
            const rawPhone = String(app.phone || "").replace(/\s/g, "").replace(/^\+?966/, "").replace(/^0/, "");
            await usersCollection.insertOne({
              name: app.name,
              email: app.email,
              mobile: rawPhone || "",
              password: tempPassword,
              role: empRole,
              employeeId,
              jobTitle: app.jobTitle,
              setupToken,
              setupTokenExpiry,
              needsPasswordSetup: true,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            // Send setup email
            const appUrl = process.env.APP_URL || "https://tuwaiqassociation.sa";
            const setupLink = `${appUrl}/setup-password?token=${setupToken}`;
            const template = emailTemplates.employeeSetup(app.name, employeeId, setupLink, empRole);
            await sendEmail({ to: app.email, subject: template.subject, html: template.html });
          }
        }
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Error updating job application status:", err);
      res.status(500).json({ message: "خطأ في تحديث حالة الطلب" });
    }
  });

  app.delete("/api/job-applications/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      const applicationId = String(req.params.id);
      await db.collection("job_applications").deleteOne({ _id: new ObjectId(applicationId) });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف الطلب" });
    }
  });

  // ==================== INVOICES ROUTES ====================
  app.get("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = (req.user as any).id;
      const invoices = await db.collection("invoices")
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray();
      res.json(invoices.map((i: any) => ({ ...i, id: i._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الفواتير" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await db.collection("invoices").findOne({ _id: new ObjectId(String(req.params.id)) });
      if (!invoice) return res.status(404).json({ message: "الفاتورة غير موجودة" });
      res.json({ ...invoice, id: invoice._id.toString() });
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الفاتورة" });
    }
  });

  // ==================== ROLES MANAGEMENT ====================
  app.get("/api/roles", requireRole("admin"), async (req, res) => {
    try {
      const roles = await db.collection("roles").find({}).toArray();
      res.json(roles.map((r: any) => ({ ...r, id: r._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الأدوار" });
    }
  });

  app.post("/api/roles", requireRole("admin"), async (req, res) => {
    try {
      const { name, nameAr, permissions } = req.body;
      const result = await db.collection("roles").insertOne({
        name,
        nameAr,
        permissions,
        createdAt: new Date()
      });
      res.status(201).json({ id: result.insertedId, name, nameAr, permissions });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إنشاء الدور" });
    }
  });

  app.delete("/api/roles/:id", requireRole("admin"), async (req, res) => {
    try {
      await db.collection("roles").deleteOne({ _id: new ObjectId(String(req.params.id)) });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف الدور" });
    }
  });

  // ==================== EMPLOYEES MANAGEMENT ====================
  app.get("/api/employees", requireRole("admin"), async (req, res) => {
    try {
      const employees = await usersCollection.find({ role: { $ne: "user" } }).toArray();
      res.json(employees.map((e: any) => ({ ...e, id: e._id.toString(), password: undefined })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الموظفين" });
    }
  });

  app.post("/api/employees", requireRole("admin"), async (req, res) => {
    try {
      const { name, mobile, password, role, department } = req.body;
      const existing = await storage.getUserByMobile(mobile);
      if (existing) {
        return res.status(400).json({ message: "رقم الجوال مسجل مسبقاً" });
      }
      
      const hashedPassword = await hashPassword(password);
      const result = await usersCollection.insertOne({
        name,
        mobile,
        password: hashedPassword,
        role,
        department,
        isPublicDonor: false,
        totalDonations: "0",
        createdAt: new Date()
      });
      
      res.status(201).json({ id: result.insertedId, name, mobile, role, department });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إضافة الموظف" });
    }
  });

  app.patch("/api/employees/:id", requireRole("admin"), async (req, res) => {
    try {
      const { name, role, department, isActive } = req.body;
      await usersCollection.updateOne(
        { _id: new ObjectId(String(req.params.id)) },
        { $set: { name, role, department, isActive, updatedAt: new Date() } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الموظف" });
    }
  });

  app.delete("/api/employees/:id", requireRole("admin"), async (req, res) => {
    try {
      await usersCollection.deleteOne({ _id: new ObjectId(String(req.params.id)) });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف الموظف" });
    }
  });

  // ==================== PRODUCTS / INVENTORY ====================
  app.get("/api/products", requireRole("admin", "manager", "employee", "accountant", "delivery"), async (req, res) => {
    try {
      const products = await db.collection("products").find({}).sort({ createdAt: -1 }).toArray();
      res.json(products.map((p: any) => ({ ...p, id: p._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب البضائع" });
    }
  });

  app.post("/api/products", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { name, description, category, price, unit, stock, image, isActive } = req.body;
      if (!name || price === undefined) return res.status(400).json({ message: "الاسم والسعر مطلوبان" });
      const result = await db.collection("products").insertOne({
        name, description, category: category || "عام", price: Number(price),
        unit: unit || "قطعة", stock: Number(stock) || 0, image: image || "",
        isActive: isActive !== false, createdBy: new ObjectId((req.user as any).id), createdAt: new Date()
      });
      res.status(201).json({ id: result.insertedId });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إضافة البضاعة" });
    }
  });

  app.patch("/api/products/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { name, description, category, price, unit, stock, image, isActive } = req.body;
      const update: any = { updatedAt: new Date() };
      if (name !== undefined) update.name = name;
      if (description !== undefined) update.description = description;
      if (category !== undefined) update.category = category;
      if (price !== undefined) update.price = Number(price);
      if (unit !== undefined) update.unit = unit;
      if (stock !== undefined) update.stock = Number(stock);
      if (image !== undefined) update.image = image;
      if (isActive !== undefined) update.isActive = isActive;
      await db.collection("products").updateOne({ _id: new ObjectId(String(req.params.id)) }, { $set: update });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث البضاعة" });
    }
  });

  app.delete("/api/products/:id", requireRole("admin"), async (req, res) => {
    try {
      await db.collection("products").deleteOne({ _id: new ObjectId(String(req.params.id)) });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف البضاعة" });
    }
  });

  // ==================== BENEFICIARIES ====================
  app.get("/api/beneficiaries", requireRole("admin", "manager", "employee"), async (req, res) => {
    try {
      const beneficiaries = await db.collection("beneficiaries").find({}).sort({ createdAt: -1 }).toArray();
      res.json(beneficiaries.map((b: any) => ({ ...b, id: b._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب المستفيدين" });
    }
  });

  app.post("/api/beneficiaries", requireRole("admin", "manager", "employee"), async (req, res) => {
    try {
      const { name, phone, address, nationalId, familySize, notes, status } = req.body;
      if (!name || !phone) return res.status(400).json({ message: "الاسم والجوال مطلوبان" });
      const result = await db.collection("beneficiaries").insertOne({
        name, phone, address, nationalId, familySize: Number(familySize) || 1,
        notes, status: status || "active", createdBy: new ObjectId((req.user as any).id), createdAt: new Date()
      });
      res.status(201).json({ id: result.insertedId });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إضافة المستفيد" });
    }
  });

  app.patch("/api/beneficiaries/:id", requireRole("admin", "manager", "employee"), async (req, res) => {
    try {
      const { name, phone, address, nationalId, familySize, notes, status } = req.body;
      await db.collection("beneficiaries").updateOne(
        { _id: new ObjectId(String(req.params.id)) },
        { $set: { name, phone, address, nationalId, familySize: Number(familySize), notes, status, updatedAt: new Date() } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث المستفيد" });
    }
  });

  app.delete("/api/beneficiaries/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      await db.collection("beneficiaries").deleteOne({ _id: new ObjectId(String(req.params.id)) });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف المستفيد" });
    }
  });

  // ==================== DELIVERY ORDERS ====================
  app.get("/api/delivery-orders", requireRole("admin", "delivery", "manager"), async (req, res) => {
    try {
      const user = req.user as any;
      const query = user.role === "delivery" ? { assignedTo: new ObjectId(user.id) } : {};
      const orders = await db.collection("delivery_orders")
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.json(orders.map((o: any) => ({ ...o, id: o._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الطلبات" });
    }
  });

  app.post("/api/delivery-orders", requireRole("admin", "accountant", "manager"), async (req, res) => {
    try {
      const { beneficiaryName, beneficiaryPhone, beneficiaryAddress, items, notes, assignedTo } = req.body;
      const result = await db.collection("delivery_orders").insertOne({
        beneficiaryName,
        beneficiaryPhone,
        beneficiaryAddress,
        items,
        notes,
        assignedTo: assignedTo ? new ObjectId(assignedTo) : null,
        status: "pending",
        createdBy: new ObjectId((req.user as any).id),
        createdAt: new Date()
      });
      res.status(201).json({ id: result.insertedId });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إنشاء الطلب" });
    }
  });

  app.patch("/api/delivery-orders/:id", requireRole("admin", "delivery", "manager"), async (req, res) => {
    try {
      const { status, deliveryImage, deliveryNotes, assignedTo } = req.body;
      const updateData: any = { updatedAt: new Date() };
      
      if (status) updateData.status = status;
      if (deliveryImage) updateData.deliveryImage = deliveryImage;
      if (deliveryNotes) updateData.deliveryNotes = deliveryNotes;
      if (assignedTo) updateData.assignedTo = new ObjectId(String(assignedTo));
      if (status === "delivered") updateData.deliveredAt = new Date();
      
      await db.collection("delivery_orders").updateOne(
        { _id: new ObjectId(String(req.params.id)) },
        { $set: updateData }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الطلب" });
    }
  });

  // ==================== SERVICES/PROGRAMS ====================
  app.get("/api/services", async (req, res) => {
    try {
      const services = await db.collection("services").find({ isActive: true }).toArray();
      res.json(services.map((s: any) => ({ ...s, id: s._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الخدمات" });
    }
  });

  app.get("/api/services/:slug", async (req, res) => {
    try {
      const service = await db.collection("services").findOne({ slug: req.params.slug });
      if (!service) return res.status(404).json({ message: "الخدمة غير موجودة" });
      res.json({ ...service, id: service._id.toString() });
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الخدمة" });
    }
  });

  app.post("/api/services", requireRole("admin", "editor"), async (req, res) => {
    try {
      const { title, titleEn, slug, description, descriptionEn, icon, image, targetAmount, currentAmount, isActive } = req.body;
      const result = await db.collection("services").insertOne({
        title,
        titleEn,
        slug,
        description,
        descriptionEn,
        icon,
        image,
        targetAmount: targetAmount || 0,
        currentAmount: currentAmount || 0,
        isActive: isActive !== false,
        createdAt: new Date()
      });
      res.status(201).json({ id: result.insertedId });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إنشاء الخدمة" });
    }
  });

  app.put("/api/services/:id", requireRole("admin", "editor"), async (req, res) => {
    try {
      const { title, titleEn, slug, description, descriptionEn, icon, image, targetAmount, currentAmount, isActive } = req.body;
      await db.collection("services").updateOne(
        { _id: new ObjectId(String(req.params.id)) },
        { $set: { title, titleEn, slug, description, descriptionEn, icon, image, targetAmount, currentAmount, isActive, updatedAt: new Date() } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الخدمة" });
    }
  });

  // ==================== ADMIN STATS ====================
  app.get(api.admin.getStats.path, requireRole("admin", "accountant", "manager"), async (req, res) => {
    try {
      const donations = await donationsCollection.find({
        status: { $in: ["success", "confirmed"] },
        isDeleted: { $ne: true },
      }).toArray();
      const totalDonations = donations.reduce((sum: number, d: any) => sum + Number(d.amount), 0);
      
      const stats = await db.collection("system_stats").findOne({});
      const totalOrganizations = stats?.totalOrganizations || 0;
      const totalBeneficiaries = stats?.totalBeneficiaries || 0;
      const feePercentage = Number(stats?.employee_fees_percentage || 10);
      
      const employeeFees = (totalDonations * feePercentage) / 100;
      const netDonations = totalDonations - employeeFees;

      res.json({
        totalDonations: String(totalDonations),
        totalOrganizations,
        totalBeneficiaries,
        employeeFees: String(employeeFees),
        netDonations: String(netDonations),
      });
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
  });

  app.patch(api.admin.updateSettings.path, requireRole("admin"), async (req, res) => {
    try {
      const input = req.body;
      await db.collection("system_stats").updateOne(
        {},
        { $set: { ...input, updatedAt: new Date() } },
        { upsert: true }
      );
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الإعدادات" });
    }
  });

  // ==================== LEADERBOARD ====================
  app.get(api.leaderboard.list.path, async (req, res) => {
    try {
      const cached = getCache("leaderboard");
      if (cached) return res.json(cached);
      const topDonors = await storage.getTopDonors();
      const data = topDonors.map((d: any) => ({ ...d, totalDonations: String(d.totalDonations) }));
      setCache("leaderboard", data, 120_000);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب قائمة المتبرعين" });
    }
  });

  // ==================== CONTENT MANAGEMENT ====================
  app.get("/api/content/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const content = await db.collection("content").findOne({ slug });
      if (!content) {
        return res.json({ slug, title: "", titleEn: "", content: "", contentEn: "" });
      }
      res.json({ ...content, id: content._id?.toString() });
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب المحتوى" });
    }
  });

  app.put("/api/content/:slug", requireRole("admin", "editor"), async (req, res) => {
    try {
      const { slug } = req.params;
      const { title, titleEn, content: contentText, contentEn, imageUrl, videoUrl, metaDescription, metaDescriptionEn } = req.body;
      await db.collection("content").updateOne(
        { slug },
        { 
          $set: { 
            title, 
            titleEn, 
            content: contentText, 
            contentEn, 
            imageUrl, 
            videoUrl, 
            metaDescription, 
            metaDescriptionEn, 
            updatedAt: new Date() 
          } 
        },
        { upsert: true }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث المحتوى" });
    }
  });

  // ==================== SHEIKHS ================================================
  // Public
  app.get("/api/sheikhs", async (req, res) => {
    try {
      const sheikhs = await db.collection("sheikhs").find({ isActive: true }).sort({ order: 1, createdAt: 1 }).toArray();
      res.json(sheikhs.map((s: any) => ({ ...s, id: s._id.toString() })));
    } catch { res.status(500).json({ message: "خطأ في جلب المشايخ" }); }
  });

  // Admin
  app.get("/api/admin/sheikhs", requireRole("admin", "manager"), async (req, res) => {
    try {
      const sheikhs = await db.collection("sheikhs").find({}).sort({ order: 1, createdAt: 1 }).toArray();
      res.json(sheikhs.map((s: any) => ({ ...s, id: s._id.toString() })));
    } catch { res.status(500).json({ message: "خطأ في جلب المشايخ" }); }
  });

  app.post("/api/admin/sheikhs", requireRole("admin", "manager"), async (req, res) => {
    try {
      const result = await db.collection("sheikhs").insertOne({ ...req.body, createdAt: new Date(), updatedAt: new Date() });
      res.json({ success: true, id: result.insertedId });
    } catch { res.status(500).json({ message: "خطأ في إضافة الشيخ" }); }
  });

  app.put("/api/admin/sheikhs/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      await db.collection("sheikhs").updateOne(
        { _id: new ObjectId(String(req.params.id)) },
        { $set: { ...req.body, updatedAt: new Date() } }
      );
      res.json({ success: true });
    } catch { res.status(500).json({ message: "خطأ في تحديث الشيخ" }); }
  });

  app.delete("/api/admin/sheikhs/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      await db.collection("sheikhs").deleteOne({ _id: new ObjectId(String(req.params.id)) });
      res.json({ success: true });
    } catch { res.status(500).json({ message: "خطأ في حذف الشيخ" }); }
  });
  // ===========================================================================

  // ==================== SLIDER MANAGEMENT ====================
  // Public: get active slider items (videos only)
  app.get("/api/slider", async (req: Request, res: Response) => {
    try {
      const cached = getCache("slider");
      if (cached) return res.json(cached);
      const items = await sliderItemsCollection
        .find({ isActive: true, mediaType: "video" })
        .sort({ order: 1, createdAt: 1 })
        .toArray();
      const data = items.map((d: any) => ({ ...d, id: d._id.toString() }));
      setCache("slider", data, 300_000);
      res.json(data);
    } catch {
      res.status(500).json({ message: "خطأ في جلب الشرائح" });
    }
  });

  // Admin: get all slider items
  app.get("/api/admin/slider", requireRole("admin", "manager"), async (req: Request, res: Response) => {
    try {
      const items = await sliderItemsCollection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
      res.json(items.map((d: any) => ({ ...d, id: d._id.toString() })));
    } catch {
      res.status(500).json({ message: "خطأ في جلب الشرائح" });
    }
  });

  // Admin: upload media and create slider item
  app.post("/api/admin/slider", requireRole("admin", "manager"), upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ message: "يجب رفع ملف" });
      const ext = path.extname(req.file.originalname).toLowerCase();
      const videoExts = [".mp4", ".webm", ".mov", ".avi"];
      const mediaType = videoExts.includes(ext) ? "video" : "image";
      const mediaUrl = `/uploads/${req.file.filename}`;
      const body = req.body;
      const doc = {
        mediaType,
        mediaUrl,
        title: body.title || "",
        subtitle: body.subtitle || "",
        primaryLink: body.primaryLink || "/donate",
        primaryLabel: body.primaryLabel || "تبرع الآن",
        secondaryLink: body.secondaryLink || "",
        secondaryLabel: body.secondaryLabel || "",
        order: Number(body.order) || 0,
        isActive: body.isActive !== "false",
        createdAt: new Date(),
      };
      const result = await sliderItemsCollection.insertOne(doc);
      res.json({ ...doc, id: result.insertedId.toString() });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إضافة الشريحة" });
    }
  });

  // Admin: update slider item
  app.put("/api/admin/slider/:id", requireRole("admin", "manager"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, subtitle, primaryLink, primaryLabel, secondaryLink, secondaryLabel, order, isActive } = req.body;
      await sliderItemsCollection.updateOne(
        { _id: new ObjectId(String(id)) },
        { $set: { title, subtitle, primaryLink, primaryLabel, secondaryLink, secondaryLabel, order: Number(order), isActive } }
      );
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "خطأ في تحديث الشريحة" });
    }
  });

  // Admin: toggle active
  app.patch("/api/admin/slider/:id/toggle", requireRole("admin", "manager"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const item = await sliderItemsCollection.findOne({ _id: new ObjectId(String(id)) });
      if (!item) return res.status(404).json({ message: "الشريحة غير موجودة" });
      await sliderItemsCollection.updateOne({ _id: new ObjectId(String(id)) }, { $set: { isActive: !item.isActive } });
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "خطأ في التبديل" });
    }
  });

  // Admin: delete slider item
  app.delete("/api/admin/slider/:id", requireRole("admin", "manager"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const item = await sliderItemsCollection.findOne({ _id: new ObjectId(String(id)) });
      if (item?.mediaUrl?.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), item.mediaUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      await sliderItemsCollection.deleteOne({ _id: new ObjectId(String(id)) });
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "خطأ في حذف الشريحة" });
    }
  });

  // ==================== FILE UPLOAD ====================
  app.use("/uploads", express.static(uploadDir));

  // Upload endpoint: saves to MongoDB for persistence across restarts
  app.post("/api/upload", memoryUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "لم يتم اختيار ملف" });
      }
      const base64 = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype;
      const dataUrl = `data:${mimeType};base64,${base64}`;
      const result = await db.collection("uploads").insertOne({
        image: dataUrl,
        mimeType,
        originalName: req.file.originalname,
        createdAt: new Date(),
      });
      const fileUrl = `/api/uploads/${result.insertedId.toString()}`;
      res.json({ url: fileUrl });
    } catch (err) {
      res.status(500).json({ message: "خطأ في رفع الملف" });
    }
  });

  app.get("/api/uploads/:id", async (req, res) => {
    try {
      const uploadId = String(req.params.id);
      const uploadDoc = await db.collection("uploads").findOne({ _id: new ObjectId(uploadId) });
      if (!uploadDoc) return res.status(404).json({ message: "الملف غير موجود" });
      const mimeType = uploadDoc.mimeType || "image/jpeg";
      const base64Data = uploadDoc.image.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      res.set("Content-Type", mimeType);
      res.set("Cache-Control", "public, max-age=31536000");
      res.send(buffer);
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الملف" });
    }
  });

  // ==================== ADMIN USERS ====================
  app.get("/api/admin/users", requireRole("admin"), async (req, res) => {
    try {
      const users = await usersCollection.find({}).toArray();
      res.json(users.map((u: any) => ({ ...u, id: u._id.toString(), password: undefined })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب المستخدمين" });
    }
  });

  // ==================== BANK ACCOUNTS ====================
  const STATIC_BANK_ACCOUNTS = [
    {
      id: "1",
      bankName: "مصرف الراجحي",
      bankNameEn: "Al Rajhi Bank",
      accountName: "جمعية طويق للخدمات الإنسانية",
      iban: "SA3080000589608019567923",
      color: "emerald",
    },
    {
      id: "2",
      bankName: "البنك العربي الوطني",
      bankNameEn: "Arab National Bank (ANB)",
      accountName: "جمعية طويق للخدمات الإنسانية",
      iban: "SA6930400108095810360018",
      color: "blue",
    },
    {
      id: "3",
      bankName: "بنك البلاد",
      bankNameEn: "Bank AlBilad",
      accountName: "جمعية طويق للخدمات الإنسانية",
      iban: "SA23150009999146128000007",
      color: "orange",
    },
  ];

  app.get("/api/bank-accounts", async (req, res) => {
    try {
      const dbAccounts = await db.collection("bankAccounts").find({}).toArray();
      if (dbAccounts.length > 0) {
        return res.json(dbAccounts.map((a: any) => ({ ...a, id: a._id.toString() })));
      }
      res.json(STATIC_BANK_ACCOUNTS);
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الحسابات البنكية" });
    }
  });

  app.put("/api/admin/bank-accounts", requireRole("admin", "manager"), async (req, res) => {
    try {
      const accounts = req.body;
      if (!Array.isArray(accounts)) {
        return res.status(400).json({ message: "يجب إرسال مصفوفة من الحسابات" });
      }
      await db.collection("bankAccounts").deleteMany({});
      if (accounts.length > 0) {
        const docs = accounts.map(({ id, ...rest }) => ({
          ...rest,
          updatedAt: new Date()
        }));
        await db.collection("bankAccounts").insertMany(docs);
      }
      res.json({ message: "تم تحديث الحسابات البنكية بنجاح" });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الحسابات البنكية" });
    }
  });

  // ==================== CONTACT MESSAGES ====================
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;
      if (!name || !message) {
        return res.status(400).json({ message: "الاسم والرسالة مطلوبان" });
      }
      await db.collection("contactMessages").insertOne({
        name,
        email: email || "",
        phone: phone || "",
        subject: subject || "",
        message,
        createdAt: new Date(),
        isRead: false,
      });
      res.json({ success: true, message: "تم استلام رسالتك بنجاح، وسنتواصل معك قريباً" });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إرسال الرسالة" });
    }
  });

  app.get("/api/admin/contact-messages", requireRole("admin", "manager"), async (req, res) => {
    try {
      const messages = await db.collection("contactMessages").find({}).sort({ createdAt: -1 }).toArray();
      res.json(messages.map((m: any) => ({ ...m, id: m._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الرسائل" });
    }
  });

  app.put("/api/admin/contact-messages/:id/read", requireRole("admin", "manager"), async (req, res) => {
    try {
      await db.collection("contactMessages").updateOne(
        { _id: new ObjectId(String(req.params.id)) },
        { $set: { isRead: true } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الرسالة" });
    }
  });

  // ==================== SITE SETTINGS ====================
  app.get("/api/settings", async (req, res) => {
    try {
      const cached = getCache("settings");
      if (cached) return res.json(cached);
      const settings = await db.collection("settings").findOne({});
      const data = settings || {};
      setCache("settings", data, 300_000);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الإعدادات" });
    }
  });

  app.put("/api/settings", requireRole("admin"), async (req, res) => {
    try {
      invalidateCache("settings");
      const { _id, id, ...body } = req.body;
      await db.collection("settings").updateOne(
        {},
        { $set: { ...body, updatedAt: new Date() } },
        { upsert: true }
      );
      res.json({ success: true });
    } catch (err: any) {
      console.error("Settings save error:", err?.message || err);
      res.status(500).json({ message: "خطأ في حفظ الإعدادات" });
    }
  });

  // ==================== ATTENDANCE ====================
  app.post("/api/attendance/checkin", requireRole("admin", "manager", "employee", "accountant", "delivery"), async (req, res) => {
    try {
      const userId = (req as any).user._id.toString();
      const today = new Date().toISOString().split("T")[0];
      const existing = await db.collection("attendance").findOne({ userId, date: today });
      if (existing && existing.checkIn) return res.status(400).json({ message: "تم تسجيل الدخول مسبقاً لهذا اليوم" });
      await db.collection("attendance").updateOne(
        { userId, date: today },
        { $set: { userId, date: today, checkIn: new Date(), userName: (req as any).user.name || (req as any).user.username, userRole: (req as any).user.role } },
        { upsert: true }
      );
      await createNotification(db, "admin", "manager", `تسجيل حضور: ${(req as any).user.name || (req as any).user.username}`, "attendance");
      res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "خطأ في تسجيل الحضور" }); }
  });

  app.post("/api/attendance/checkout", requireRole("admin", "manager", "employee", "accountant", "delivery"), async (req, res) => {
    try {
      const userId = (req as any).user._id.toString();
      const today = new Date().toISOString().split("T")[0];
      const existing = await db.collection("attendance").findOne({ userId, date: today });
      if (!existing || !existing.checkIn) return res.status(400).json({ message: "لم يتم تسجيل الدخول بعد" });
      if (existing.checkOut) return res.status(400).json({ message: "تم تسجيل الخروج مسبقاً" });
      const checkOut = new Date();
      const hoursWorked = ((checkOut.getTime() - new Date(existing.checkIn).getTime()) / 3600000).toFixed(2);
      await db.collection("attendance").updateOne({ userId, date: today }, { $set: { checkOut, hoursWorked: parseFloat(hoursWorked) } });
      res.json({ success: true, hoursWorked });
    } catch (err) { res.status(500).json({ message: "خطأ في تسجيل الانصراف" }); }
  });

  app.get("/api/attendance", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { date, userId } = req.query;
      const filter: any = {};
      if (date) filter.date = date;
      if (userId) filter.userId = userId;
      const records = await db.collection("attendance").find(filter).sort({ date: -1 }).limit(500).toArray();
      res.json(records);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب الحضور" }); }
  });

  app.get("/api/attendance/my", requireRole("admin", "manager", "employee", "accountant", "delivery"), async (req, res) => {
    try {
      const userId = (req as any).user._id.toString();
      const records = await db.collection("attendance").find({ userId }).sort({ date: -1 }).limit(60).toArray();
      res.json(records);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب الحضور" }); }
  });

  app.get("/api/attendance/today", requireRole("admin", "manager", "employee", "accountant", "delivery"), async (req, res) => {
    try {
      const userId = (req as any).user._id.toString();
      const today = new Date().toISOString().split("T")[0];
      const record = await db.collection("attendance").findOne({ userId, date: today });
      res.json(record || null);
    } catch (err) { res.status(500).json({ message: "خطأ" }); }
  });

  // ==================== LEAVE REQUESTS ====================
  app.post("/api/leave-requests", requireRole("admin", "manager", "employee", "accountant", "delivery"), async (req, res) => {
    try {
      const user = (req as any).user;
      const doc = {
        ...req.body,
        userId: user._id.toString(),
        userName: user.name || user.username,
        userRole: user.role,
        status: "pending",
        createdAt: new Date(),
      };
      const result = await db.collection("leave_requests").insertOne(doc);
      await createNotification(db, "admin", "manager", `طلب إجازة جديد من ${user.name || user.username}`, "leave");
      res.json({ ...doc, _id: result.insertedId });
    } catch (err) { res.status(500).json({ message: "خطأ في تقديم طلب الإجازة" }); }
  });

  app.get("/api/leave-requests", requireRole("admin", "manager"), async (req, res) => {
    try {
      const records = await db.collection("leave_requests").find({}).sort({ createdAt: -1 }).toArray();
      res.json(records);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب طلبات الإجازة" }); }
  });

  app.get("/api/leave-requests/my", requireRole("admin", "manager", "employee", "accountant", "delivery"), async (req, res) => {
    try {
      const userId = (req as any).user._id.toString();
      const records = await db.collection("leave_requests").find({ userId }).sort({ createdAt: -1 }).toArray();
      res.json(records);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب طلباتي" }); }
  });

  app.patch("/api/leave-requests/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { status, note } = req.body;
      await db.collection("leave_requests").updateOne(
        { _id: new ObjectId(String(req.params.id)) },
        { $set: { status, adminNote: note, updatedAt: new Date() } }
      );
      res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "خطأ في تحديث الطلب" }); }
  });

  // ==================== STOCK MOVEMENTS ====================
  app.get("/api/stock-movements", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { productId } = req.query;
      const filter: any = {};
      if (productId) filter.productId = productId;
      const records = await db.collection("stock_movements").find(filter).sort({ createdAt: -1 }).limit(200).toArray();
      res.json(records);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب حركة المخزون" }); }
  });

  app.post("/api/stock-movements", requireRole("admin", "manager"), async (req, res) => {
    try {
      const user = (req as any).user;
      const { productId, productName, type, quantity, reason, notes } = req.body;
      const product = await db.collection("products").findOne({ _id: new ObjectId(String(productId)) });
      if (!product) return res.status(404).json({ message: "المنتج غير موجود" });
      const currentQty = product.quantity || 0;
      const delta = type === "in" ? Number(quantity) : -Number(quantity);
      const newQty = currentQty + delta;
      if (newQty < 0) return res.status(400).json({ message: "الكمية المتاحة لا تكفي" });
      await db.collection("products").updateOne({ _id: new ObjectId(String(productId)) }, { $set: { quantity: newQty } });
      const movement = {
        productId,
        productName,
        type,
        quantity: Number(quantity),
        reason,
        notes: notes || "",
        quantityBefore: currentQty,
        quantityAfter: newQty,
        userId: user._id.toString(),
        userName: user.name || user.username,
        createdAt: new Date(),
      };
      await db.collection("stock_movements").insertOne(movement);
      if (newQty <= (product.minStock || 5)) {
        await createNotification(db, "admin", "manager", `تنبيه: مخزون منخفض للمنتج "${productName}" (${newQty} متبقي)`, "stock");
      }
      res.json({ success: true, newQuantity: newQty });
    } catch (err) { res.status(500).json({ message: "خطأ في تحديث المخزون" }); }
  });

  // ==================== NOTIFICATIONS ====================
  app.get("/api/notifications", requireRole("admin", "manager", "employee", "accountant", "delivery"), async (req, res) => {
    try {
      const user = (req as any).user;
      const filter: any = { $or: [{ targetRole: user.role }, { targetRole: "all" }, { targetUserId: user._id.toString() }] };
      const notifications = await db.collection("notifications").find(filter).sort({ createdAt: -1 }).limit(50).toArray();
      res.json(notifications);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب الإشعارات" }); }
  });

  app.patch("/api/notifications/:id/read", requireRole("admin", "manager", "employee", "accountant", "delivery"), async (req, res) => {
    try {
      const userId = (req as any).user._id.toString();
      await db.collection("notifications").updateOne(
        { _id: new ObjectId(String(req.params.id)) },
        { $addToSet: { readBy: userId } }
      );
      res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "خطأ" }); }
  });

  app.patch("/api/notifications/mark-all-read", requireRole("admin", "manager", "employee", "accountant", "delivery"), async (req, res) => {
    try {
      const userId = (req as any).user._id.toString();
      const user = (req as any).user;
      await db.collection("notifications").updateMany(
        { $or: [{ targetRole: user.role }, { targetRole: "all" }] },
        { $addToSet: { readBy: userId } }
      );
      res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "خطأ" }); }
  });

  app.post("/api/notifications", requireRole("admin", "manager"), async (req, res) => {
    try {
      const user = (req as any).user;
      const { message, targetRole, type } = req.body;
      const doc = {
        message,
        targetRole: targetRole || "all",
        type: type || "info",
        readBy: [],
        createdBy: user._id.toString(),
        createdAt: new Date(),
      };
      await db.collection("notifications").insertOne(doc);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "خطأ في إرسال الإشعار" }); }
  });

  // ==================== AID RECORDS ====================
  app.get("/api/aid-records", requireRole("admin", "manager", "employee"), async (req, res) => {
    try {
      const { beneficiaryId } = req.query;
      const filter: any = {};
      if (beneficiaryId) filter.beneficiaryId = beneficiaryId;
      const records = await db.collection("aid_records").find(filter).sort({ createdAt: -1 }).toArray();
      res.json(records);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب سجلات المساعدات" }); }
  });

  app.post("/api/aid-records", requireRole("admin", "manager", "employee"), async (req, res) => {
    try {
      const user = (req as any).user;
      const doc = {
        ...req.body,
        addedBy: user.name || user.username,
        createdAt: new Date(),
      };
      const result = await db.collection("aid_records").insertOne(doc);
      res.json({ ...doc, _id: result.insertedId });
    } catch (err) { res.status(500).json({ message: "خطأ في إضافة سجل المساعدة" }); }
  });

  app.delete("/api/aid-records/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      await db.collection("aid_records").deleteOne({ _id: new ObjectId(String(req.params.id)) });
      res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "خطأ في حذف السجل" }); }
  });

  // ==================== ENHANCED STATS ====================
  app.get("/api/admin/analytics", requireRole("admin", "manager", "accountant"), async (req, res) => {
    try {
      const now = new Date();
      const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
      const donationsByMonth: Record<string, number> = {};
      const beneficiariesByMonth: Record<string, number> = {};
      const deliveriesByMonth: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = months[d.getMonth()];
        donationsByMonth[label] = 0;
        beneficiariesByMonth[label] = 0;
        deliveriesByMonth[label] = 0;
      }
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const donations = await db.collection("donations").find({
        createdAt: { $gte: sixMonthsAgo },
        status: { $in: ["success", "confirmed"] },
        isDeleted: { $ne: true },
      }).toArray();
      for (const d of donations) {
        const label = months[new Date(d.createdAt).getMonth()];
        if (donationsByMonth[label] !== undefined) donationsByMonth[label] += d.amount || 0;
      }
      const beneficiaries = await db.collection("beneficiaries").find({ createdAt: { $gte: sixMonthsAgo } }).toArray();
      for (const b of beneficiaries) {
        const label = months[new Date(b.createdAt).getMonth()];
        if (beneficiariesByMonth[label] !== undefined) beneficiariesByMonth[label]++;
      }
      const deliveries = await db.collection("delivery_orders").find({ createdAt: { $gte: sixMonthsAgo } }).toArray();
      for (const d of deliveries) {
        const label = months[new Date(d.createdAt).getMonth()];
        if (deliveriesByMonth[label] !== undefined) deliveriesByMonth[label]++;
      }
      const allDeliveries = await db.collection("delivery_orders").find({}).toArray();
      const deliveryStats = {
        total: allDeliveries.length,
        delivered: allDeliveries.filter(d => d.status === "delivered").length,
        pending: allDeliveries.filter(d => d.status === "pending").length,
        in_transit: allDeliveries.filter(d => d.status === "in_transit").length,
        failed: allDeliveries.filter(d => d.status === "failed").length,
        returned: allDeliveries.filter(d => d.status === "returned").length,
        assigned: allDeliveries.filter(d => d.status === "assigned").length,
      };
      const agents = await db.collection("users").find({ role: "delivery" }).toArray();
      const agentStats = await Promise.all(agents.map(async (agent) => {
        const agentOrders = await db.collection("delivery_orders").find({ agentId: agent._id.toString() }).toArray();
        const delivered = agentOrders.filter(o => o.status === "delivered").length;
        return {
          name: agent.name || agent.username,
          total: agentOrders.length,
          delivered,
          rate: agentOrders.length > 0 ? Math.round((delivered / agentOrders.length) * 100) : 0,
        };
      }));
      const products = await db.collection("products").find({}).toArray();
      const lowStock = products.filter(p => (p.quantity || 0) <= (p.minStock || 5));
      const donationTypes = await db.collection("donations").aggregate([
        { $match: { status: { $in: ["success", "confirmed"] }, isDeleted: { $ne: true } } },
        { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } }
      ]).toArray();
      res.json({
        donationsByMonth: Object.entries(donationsByMonth).map(([name, amount]) => ({ name, amount })),
        beneficiariesByMonth: Object.entries(beneficiariesByMonth).map(([name, count]) => ({ name, count })),
        deliveriesByMonth: Object.entries(deliveriesByMonth).map(([name, count]) => ({ name, count })),
        deliveryStats,
        agentStats,
        lowStockCount: lowStock.length,
        lowStockProducts: lowStock.map(p => ({ name: p.name, quantity: p.quantity, minStock: p.minStock || 5 })),
        donationTypes: donationTypes.map(t => ({ name: t._id || "غير محدد", value: t.total, count: t.count })),
      });
    } catch (err) { res.status(500).json({ message: "خطأ في جلب الإحصائيات" }); }
  });

  // ==================== PASSWORD SETUP (Employee Onboarding) ====================
  app.post("/api/auth/setup-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ message: "البيانات ناقصة" });
      const user = await usersCollection.findOne({ setupToken: token });
      if (!user) return res.status(404).json({ message: "الرابط غير صالح أو منتهي الصلاحية" });
      if (user.setupTokenExpiry && new Date(user.setupTokenExpiry) < new Date()) {
        return res.status(400).json({ message: "انتهت صلاحية الرابط، تواصل مع الإدارة" });
      }
      const hashedPassword = await hashPassword(password);
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword, setupToken: null, setupTokenExpiry: null, needsPasswordSetup: false, updatedAt: new Date() } }
      );
      res.json({ success: true, message: "تم إعداد كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن." });
    } catch (err) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/auth/verify-setup-token", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) return res.status(400).json({ message: "رمز غير صالح" });
      const user = await usersCollection.findOne({ setupToken: String(token) });
      if (!user) return res.status(404).json({ message: "الرابط غير صالح" });
      if (user.setupTokenExpiry && new Date(user.setupTokenExpiry) < new Date()) {
        return res.status(400).json({ message: "انتهت صلاحية الرابط" });
      }
      res.json({ name: user.name, employeeId: user.employeeId, role: user.role });
    } catch (err) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // ==================== EMPLOYEE ROLE MANAGEMENT ====================
  app.patch("/api/admin/users/:id/role", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { role } = req.body;
      const validRoles = ["user", "employee", "delivery", "programmer", "accountant", "sales", "manager", "admin"];
      if (!validRoles.includes(role)) return res.status(400).json({ message: "دور غير صالح" });
      await usersCollection.updateOne(
        { _id: new ObjectId(String(req.params.id)) },
        { $set: { role, updatedAt: new Date() } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الدور" });
    }
  });

  // Resend setup email for employee
  app.post("/api/admin/users/:id/resend-setup", requireRole("admin", "manager"), async (req, res) => {
    try {
      const user = await usersCollection.findOne({ _id: new ObjectId(String(req.params.id)) });
      if (!user || !user.email) return res.status(404).json({ message: "المستخدم غير موجود أو لا يملك بريداً" });
      const setupToken = randomBytes(32).toString("hex");
      const setupTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await usersCollection.updateOne({ _id: user._id }, { $set: { setupToken, setupTokenExpiry, needsPasswordSetup: true } });
      const appUrl = process.env.APP_URL || "https://tuwaiqassociation.sa";
      const setupLink = `${appUrl}/setup-password?token=${setupToken}`;
      const template = emailTemplates.employeeSetup(user.name, user.employeeId || "TQ-???", setupLink, user.role || "employee");
      await sendEmail({ to: user.email, subject: template.subject, html: template.html });
      res.json({ success: true, message: "تم إعادة إرسال رابط الإعداد" });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إرسال الرابط" });
    }
  });

  // ==================== INTERNAL CHAT ====================
  app.get("/api/chat/contacts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const me = (req.user as any).id;
      const employees = await usersCollection.find(
        { _id: { $ne: new ObjectId(String(me)) }, role: { $nin: ["user"] } },
        { projection: { password: 0, setupToken: 0 } }
      ).toArray();
      res.json(employees.map((e: any) => ({ ...e, id: e._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب جهات الاتصال" });
    }
  });

  app.get("/api/chat/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const me = String((req.user as any).id);
      const withUser = String(req.query.with || "");
      const query = withUser
        ? {
            $or: [
              { fromId: me, toId: withUser },
              { fromId: withUser, toId: me },
            ],
          }
        : { $or: [{ fromId: me }, { toId: me }] };
      const messages = await db.collection("chat_messages")
        .find(query)
        .sort({ createdAt: 1 })
        .limit(200)
        .toArray();
      // Mark as read
      if (withUser) {
        await db.collection("chat_messages").updateMany(
          { fromId: withUser, toId: me, readAt: null },
          { $set: { readAt: new Date() } }
        );
      }
      res.json(messages.map((m: any) => ({ ...m, id: m._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الرسائل" });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const me = req.user as any;
      const { toId, message } = req.body;
      if (!toId || !message?.trim()) return res.status(400).json({ message: "بيانات ناقصة" });
      const msg = {
        fromId: String(me.id),
        fromName: me.name,
        fromEmployeeId: me.employeeId || "",
        toId: String(toId),
        message: message.trim(),
        readAt: null,
        createdAt: new Date(),
      };
      const result = await db.collection("chat_messages").insertOne(msg);
      res.status(201).json({ ...msg, id: result.insertedId.toString() });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إرسال الرسالة" });
    }
  });

  app.get("/api/chat/unread-count", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const me = String((req.user as any).id);
      const count = await db.collection("chat_messages").countDocuments({ toId: me, readAt: null });
      res.json({ count });
    } catch (err) {
      res.status(500).json({ count: 0 });
    }
  });

  // ==================== INTERNAL MAIL ====================
  app.get("/api/internal-mail", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const me = String((req.user as any).id);
      const box = req.query.box || "inbox";
      const query = box === "sent" ? { fromId: me } : { toId: me };
      const mails = await db.collection("internal_mail")
        .find(query)
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();
      res.json(mails.map((m: any) => ({ ...m, id: m._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب البريد" });
    }
  });

  app.post("/api/internal-mail", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const me = req.user as any;
      const { toEmployeeId, subject, body } = req.body;
      if (!toEmployeeId || !subject?.trim() || !body?.trim()) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }
      // Find recipient by employeeId
      const recipient = await usersCollection.findOne({ employeeId: toEmployeeId.trim() });
      if (!recipient) return res.status(404).json({ message: "المعرف الوظيفي غير موجود" });

      const mail = {
        fromId: String(me.id),
        fromName: me.name,
        fromEmployeeId: me.employeeId || "غير محدد",
        toId: recipient._id.toString(),
        toName: recipient.name,
        toEmployeeId: recipient.employeeId,
        subject: subject.trim(),
        body: body.trim(),
        readAt: null,
        createdAt: new Date(),
      };
      const result = await db.collection("internal_mail").insertOne(mail);

      // Also send email notification if recipient has email
      if (recipient.email) {
        const appUrl = process.env.APP_URL || "https://tuwaiqassociation.sa";
        const template = emailTemplates.internalMail(me.name, me.employeeId || "غير محدد", subject, body, appUrl);
        await sendEmail({ to: recipient.email, subject: template.subject, html: template.html }).catch(() => {});
      }

      res.status(201).json({ ...mail, id: result.insertedId.toString() });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إرسال الرسالة" });
    }
  });

  app.patch("/api/internal-mail/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      await db.collection("internal_mail").updateOne(
        { _id: new ObjectId(String(req.params.id)) },
        { $set: { readAt: new Date() } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث حالة البريد" });
    }
  });

  app.get("/api/internal-mail/unread-count", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const me = String((req.user as any).id);
      const count = await db.collection("internal_mail").countDocuments({ toId: me, readAt: null });
      res.json({ count });
    } catch (err) {
      res.status(500).json({ count: 0 });
    }
  });

  // ==================== ADMIN SYSTEM TASKS (for programmer role) ====================
  app.get("/api/system-tasks", requireRole("admin", "manager", "programmer"), async (req, res) => {
    try {
      const tasks = await db.collection("system_tasks").find({}).sort({ createdAt: -1 }).toArray();
      res.json(tasks.map((t: any) => ({ ...t, id: t._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب المهام" });
    }
  });

  app.post("/api/system-tasks", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { title, description, priority } = req.body;
      const task = {
        title, description,
        priority: priority || "medium",
        status: "pending",
        createdBy: (req.user as any).name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await db.collection("system_tasks").insertOne(task);
      res.status(201).json({ ...task, id: result.insertedId.toString() });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إنشاء المهمة" });
    }
  });

  app.patch("/api/system-tasks/:id/status", requireRole("admin", "manager", "programmer"), async (req, res) => {
    try {
      const { status } = req.body;
      await db.collection("system_tasks").updateOne(
        { _id: new ObjectId(String(req.params.id)) },
        { $set: { status, updatedBy: (req.user as any).name, updatedAt: new Date() } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث المهمة" });
    }
  });

  // ==================== MY DONATIONS (Donor Portal) ====================
  app.get("/api/my-donations", async (req, res) => {
    try {
      if (!(req as any).user) return res.status(401).json({ message: "غير مصرح" });
      const user = (req as any).user;
      const donations = await db.collection("donations").find({
        $or: [{ userId: user._id.toString() }, { email: user.email }]
      }).sort({ createdAt: -1 }).toArray();
      res.json(donations);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب تبرعاتي" }); }
  });

  // ==================== EMAIL ADMIN SYSTEM ====================

  // Test email
  app.post("/api/admin/email/test", requireRole("admin", "manager"), async (req, res) => {
    try {
      const me = req.user as any;
      const to = req.body.to || me.email;
      if (!to) return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });
      const template = emailTemplates.testEmail(me.name || "المدير");
      const result = await sendEmail({ to, subject: template.subject, html: template.html });
      if (result.success) {
        res.json({ success: true, messageId: result.messageId, message: `تم إرسال بريد الاختبار إلى ${to}` });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Email logs
  app.get("/api/admin/email/logs", requireRole("admin", "manager"), async (req, res) => {
    try {
      const limit = parseInt(String(req.query.limit || "100"));
      const status = req.query.status as string | undefined;
      const query: any = {};
      if (status && status !== "all") query.status = status;
      const logs = await db.collection("email_logs")
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      res.json(logs.map((l: any) => ({ ...l, id: l._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب السجلات" });
    }
  });

  // Email stats
  app.get("/api/admin/email/stats", requireRole("admin", "manager"), async (req, res) => {
    try {
      const [sent, failed, total] = await Promise.all([
        db.collection("email_logs").countDocuments({ status: "sent" }),
        db.collection("email_logs").countDocuments({ status: "failed" }),
        db.collection("email_logs").countDocuments({}),
      ]);
      const provider = process.env.SMTP2GO_API_KEY ? "SMTP2GO HTTP API" : process.env.SMTP_USER ? "SMTP" : "غير مُعدّ";
      const configured = !!(process.env.SMTP2GO_API_KEY || (process.env.SMTP_USER && process.env.SMTP_PASS));
      res.json({ sent, failed, total, provider, configured });
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
  });

  // Send broadcast email to all users (fires in background, returns immediately)
  app.post("/api/admin/email/broadcast", requireRole("admin"), async (req, res) => {
    try {
      const { subject, content, targetRole } = req.body;
      if (!subject?.trim() || !content?.trim()) {
        return res.status(400).json({ message: "الموضوع والمحتوى مطلوبان" });
      }
      const query: any = { email: { $exists: true, $ne: "" } };
      if (targetRole && targetRole !== "all") query.role = targetRole;
      const users = await usersCollection.find(query, { projection: { email: 1, name: 1 } }).toArray();
      if (users.length === 0) return res.status(400).json({ message: "لا يوجد مستخدمون بالمعايير المحددة" });

      // Respond immediately, send in background to avoid Render's 30s timeout
      res.json({ success: true, total: users.length, message: `جارٍ إرسال ${users.length} رسالة في الخلفية` });

      const template = emailTemplates.customEmail(subject, content);
      (async () => {
        let sent = 0, failed = 0;
        for (const u of users) {
          if (!u.email) continue;
          const result = await sendEmail({ to: u.email, subject: template.subject, html: template.html });
          if (result.success) sent++; else failed++;
          await new Promise(r => setTimeout(r, 200));
        }
        console.log(`[Broadcast] Done — sent: ${sent}, failed: ${failed}, total: ${users.length}`);
      })().catch(err => console.error("[Broadcast] Error:", err));
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Resend a failed email log
  app.post("/api/admin/email/resend/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      const log = await db.collection("email_logs").findOne({ _id: new ObjectId(String(req.params.id)) });
      if (!log) return res.status(404).json({ message: "السجل غير موجود" });
      const result = await sendEmail({ to: log.to, subject: log.subject, html: log.html });
      if (result.success) {
        await db.collection("email_logs").updateOne(
          { _id: log._id },
          { $set: { status: "sent", retriedAt: new Date(), messageId: result.messageId } }
        );
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ─── Qirox Integration Proxy ───────────────────────────────────────────────
  const QIROX_BASE = "https://qiroxstudio.online/api/v1";
  const qiroxHeaders = () => ({
    "Authorization": `Bearer ${process.env.QIROX_API_KEY || ""}`,
    "Content-Type": "application/json",
  });

  const qiroxEndpoints = ["me", "orders", "projects", "invoices", "stats", "wallet", "customers"];

  for (const endpoint of qiroxEndpoints) {
    app.get(`/api/qirox/${endpoint}`, async (req: Request, res: Response) => {
      try {
        const response = await fetch(`${QIROX_BASE}/${endpoint}`, { headers: qiroxHeaders() });
        if (!response.ok) {
          return res.status(response.status).json({ message: `Qirox error: ${response.statusText}` });
        }
        const data = await response.json();
        res.json(data);
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    });
  }
  // ==================== GUEST DONATION PDF EMAIL =============================
  // Allow guest donors to receive their certificate + invoice as PDF by email
  app.post("/api/donations/:id/send-pdf", async (req: Request, res: Response) => {
    try {
      const donationId = req.params.id as string;
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "يرجى إدخال بريد إلكتروني صحيح" });
      }

      const donation = await db.collection("donations").findOne({ _id: new ObjectId(donationId) });
      if (!donation) return res.status(404).json({ message: "التبرع غير موجود" });
      if (donation.status !== "confirmed") {
        return res.status(400).json({ message: "لا يمكن إرسال الوثائق قبل تأكيد التبرع" });
      }

      // Fetch or create certificate/invoice numbers
      const certRecord = await db.collection("certificates").findOne({ donationId });
      const invRecord  = await db.collection("invoices").findOne({ donationId });

      const certNum = certRecord?.certificateNumber || `TQ-CERT-${Date.now()}`;
      const invNum  = invRecord?.invoiceNumber  || `TQ-INV-${Date.now()}`;

      const donorName = donation.donorName || "فاعل خير";
      const amount    = donation.amount    || 0;
      const type      = donation.type      || "general";

      const [certPdf, invPdf] = await Promise.all([
        generateCertificatePDF({ donorName, amount, type, certificateNumber: certNum }),
        generateInvoicePDF({ donorName, amount, type, invoiceNumber: invNum, receiptId: donation.receiptId }),
      ]);

      const TYPE_LABELS: Record<string, string> = {
        general: "صدقة عامة", zakat: "زكاة مال", waqf: "وقف",
        hajj: "كفالة حاج", families: "كفالة أسر أرامل ومطلقات",
        orphan: "كفالة يتيم", relief: "تفريج كربة",
        water: "سقيا الماء", "ramadan-basket": "سلة رمضانية",
        iftar: "إفطار صائم", food: "إطعام الجائع", "special-cases": "حالات خاصة",
      };
      const typeLabel = TYPE_LABELS[type] || type;
      const dateStr   = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
      const amountFmt = `${Number(amount).toLocaleString("ar-SA")} ريال سعودي`;

      const htmlBody = `
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:#f0fdf4;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">🎉</div>
          <h2 style="color:#059669;margin:12px 0 4px;font-size:22px;">تأكيد تبرعكم الكريم</h2>
          <p style="color:#64748b;margin:0;font-size:14px;">جزاكم الله خيراً على عطائكم</p>
        </div>
        <p>السادة / <strong>${donorName}</strong>،</p>
        <p>السلام عليكم ورحمة الله وبركاته،</p>
        <p>يسعد <strong>جمعية طويق للخدمات الإنسانية</strong> إخباركم بأنه تم استلام تبرعكم وتأكيده بنجاح. نسأل الله أن يبارك في مالكم ويجعل هذا التبرع في ميزان حسناتكم.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin:20px 0;overflow:hidden;">
          <tr><td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">اسم المتبرع</td><td style="padding:10px 16px;font-weight:bold;color:#059669;border-bottom:1px solid #e2e8f0;">${donorName}</td></tr>
          <tr><td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">المبلغ</td><td style="padding:10px 16px;font-weight:bold;color:#059669;border-bottom:1px solid #e2e8f0;">${amountFmt}</td></tr>
          <tr><td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">نوع التبرع</td><td style="padding:10px 16px;font-weight:bold;color:#1e293b;border-bottom:1px solid #e2e8f0;">${typeLabel}</td></tr>
          <tr><td style="padding:10px 16px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">رقم الشهادة</td><td style="padding:10px 16px;font-weight:bold;color:#1e293b;border-bottom:1px solid #e2e8f0;">${certNum}</td></tr>
          <tr><td style="padding:10px 16px;color:#64748b;font-size:13px;">التاريخ</td><td style="padding:10px 16px;font-weight:bold;color:#1e293b;">${dateStr}</td></tr>
        </table>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin:16px 0;color:#166534;font-size:13px;">
          📎 مرفق بهذا البريد: <strong>شهادة التبرع</strong> و<strong>فاتورة الإيصال</strong> بصيغة PDF
        </div>
        <p style="color:#64748b;font-size:13px;">إذا كان لديكم أي استفسار، يمكنكم التواصل معنا عبر واتساب أو البريد الإلكتروني.</p>
      `;

      // Use nodemailer directly to support attachments
      const nodemailer = await import("nodemailer");
      const transporterOpts: any = process.env.SMTP2GO_API_KEY
        ? {
            host: "mail.smtp2go.com",
            port: 465,
            secure: true,
            auth: { user: process.env.SMTP_FROM || "noreply@tuwaiqassociation.sa", pass: process.env.SMTP2GO_API_KEY },
          }
        : {
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT || 587),
            secure: false,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          };

      const transporter = nodemailer.createTransport(transporterOpts);
      await transporter.sendMail({
        from: `"جمعية طويق للخدمات الإنسانية" <${process.env.SMTP_FROM || "noreply@tuwaiqassociation.sa"}>`,
        to: email,
        subject: `تأكيد تبرعكم — ${amountFmt} | جمعية طويق`,
        html: htmlBody,
        attachments: [
          { filename: `شهادة-تبرع-${certNum}.pdf`, content: certPdf, contentType: "application/pdf" },
          { filename: `فاتورة-${invNum}.pdf`,       content: invPdf,  contentType: "application/pdf" },
        ],
      });

      // Save guest email on donation for future reference
      await db.collection("donations").updateOne({ _id: new ObjectId(donationId) }, { $set: { donorEmail: email } });

      res.json({ success: true, message: "تم إرسال الوثائق إلى بريدك الإلكتروني" });
    } catch (err: any) {
      console.error("[PDF Email] Error:", err.message);
      res.status(500).json({ message: "حدث خطأ أثناء إرسال البريد. يرجى المحاولة لاحقاً." });
    }
  });
  // ===========================================================================

  // ───────────────────────────────────────────────────────────────────────────

  // ═══════════════════════════════════════════════════════════════════════════
  // AI ASSISTANT — employees & admins only (proxies Pollinations.ai — free, no key)
  // ═══════════════════════════════════════════════════════════════════════════
  app.post("/api/ai/chat", requireRole("admin", "employee", "accountant", "programmer", "sales", "delivery"), async (req: Request, res: Response) => {
    try {
      const { messages } = req.body as { messages: Array<{ role: string; content: string }> };
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "messages required" });
      }

      const systemPrompt = `أنت مساعد ذكي داخلي لجمعية طويق للخدمات الإنسانية. تعمل بشكل حصري مع موظفي الجمعية والمسؤولين.

مهامك الرئيسية:
- الإجابة على أسئلة الموظفين حول عمل الجمعية
- مساعدة في كتابة رسائل للمتبرعين والمستفيدين
- تلخيص تقارير التبرعات والإحصائيات
- توليد محتوى للحملات الخيرية الأربع: كفالة حاج، كفالة أسر أرامل، كفالة يتيم، تفريج كربة
- كتابة بريد إلكتروني رسمي بأسلوب الجمعية
- اقتراح أفكار لزيادة التبرعات والوعي المجتمعي
- المساعدة في صياغة التقارير الإدارية والمالية
- الرد بالعربية دائماً ما لم يُطلب خلاف ذلك

الأسلوب: مهني، رسمي، إسلامي بالاعتبار، ومحترم.
رقم الجمعية: 1000820300 — مرخصة من وزارة الموارد البشرية والتنمية الاجتماعية.`;

      const response = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: false,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("[AI] Pollinations error:", text);
        return res.status(502).json({ message: "تعذر الاتصال بالمساعد الذكي. يرجى المحاولة لاحقاً." });
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content || "لم أتمكن من الإجابة، يرجى المحاولة مجدداً.";
      res.json({ reply });
    } catch (err: any) {
      console.error("[AI] Error:", err.message);
      res.status(500).json({ message: "خطأ في المساعد الذكي" });
    }
  });

  // ─── App Files Upload / Download ────────────────────────────────────────────
  const APP_FILES_DIR = path.resolve("uploads/app-files");
  if (!fs.existsSync(APP_FILES_DIR)) fs.mkdirSync(APP_FILES_DIR, { recursive: true });

  const appFileStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, APP_FILES_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const platform = ext === ".apk" ? "android" : "ios";
      cb(null, `tuwaiq-${platform}${ext}`);
    },
  });

  const appFileUpload = multer({
    storage: appFileStorage,
    limits: { fileSize: 200 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if ([".apk", ".ipa", ".aab"].includes(ext)) cb(null, true);
      else cb(new Error("نوع الملف غير مدعوم. يرجى رفع ملف .apk أو .ipa فقط"));
    },
  });

  function getFileInfo(platform: "android" | "ios") {
    const exts = platform === "android" ? [".apk", ".aab"] : [".ipa"];
    for (const ext of exts) {
      const filePath = path.join(APP_FILES_DIR, `tuwaiq-${platform}${ext}`);
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        return {
          exists: true,
          filename: `tuwaiq-${platform}${ext}`,
          size: stat.size,
          uploadedAt: stat.mtime.toISOString(),
          ext,
        };
      }
    }
    return { exists: false };
  }

  app.post("/api/admin/app-files/upload", (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).isAuthenticated?.() || !["admin", "superadmin"].includes((req as any).user?.role)) {
      return res.status(403).json({ message: "غير مصرح" });
    }
    appFileUpload.single("file")(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      if (!req.file) return res.status(400).json({ message: "لم يتم رفع ملف" });
      const ext = path.extname(req.file.originalname).toLowerCase();
      const platform = ext === ".ipa" ? "ios" : "android";
      res.json({
        message: "تم رفع الملف بنجاح",
        platform,
        filename: req.file.filename,
        size: req.file.size,
      });
    });
  });

  app.get("/api/app-files/info", (req: Request, res: Response) => {
    res.json({
      android: getFileInfo("android"),
      ios: getFileInfo("ios"),
    });
  });

  app.get("/api/app-files/download/:platform", (req: Request, res: Response) => {
    const { platform } = req.params;
    if (platform !== "android" && platform !== "ios") {
      return res.status(400).json({ message: "منصة غير صحيحة" });
    }
    const info = getFileInfo(platform as "android" | "ios");
    if (!info.exists || !info.filename) {
      return res.status(404).json({ message: "الملف غير موجود بعد" });
    }
    const filePath = path.join(APP_FILES_DIR, info.filename);
    const mimeType = info.ext === ".apk" ? "application/vnd.android.package-archive"
      : info.ext === ".aab" ? "application/x-authorware-bin"
      : "application/octet-stream";
    res.setHeader("Content-Disposition", `attachment; filename="${info.filename}"`);
    res.setHeader("Content-Type", mimeType);
    res.sendFile(filePath);
  });

  app.delete("/api/admin/app-files/:platform", (req: Request, res: Response) => {
    if (!(req as any).isAuthenticated?.() || !["admin", "superadmin"].includes((req as any).user?.role)) {
      return res.status(403).json({ message: "غير مصرح" });
    }
    const { platform } = req.params;
    if (platform !== "android" && platform !== "ios") return res.status(400).json({ message: "منصة غير صحيحة" });
    const info = getFileInfo(platform as "android" | "ios");
    if (!info.exists || !info.filename) return res.status(404).json({ message: "الملف غير موجود" });
    fs.unlinkSync(path.join(APP_FILES_DIR, info.filename));
    res.json({ message: "تم الحذف" });
  });

  return httpServer;
}

async function createNotification(db: any, ...roles: string[]) {
  const [message, type] = roles.splice(-2);
  for (const role of roles) {
    await db.collection("notifications").insertOne({
      message,
      targetRole: role,
      type: type || "info",
      readBy: [],
      createdAt: new Date(),
    });
  }
}
