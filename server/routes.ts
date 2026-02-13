import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, donationsCollection, usersCollection } from "./db";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import MemoryStore from "memorystore";
import { ObjectId } from "mongodb";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendEmail, emailTemplates } from "./mail";

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
  const SessionStore = MemoryStore(session);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "twaq_secret_key",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 86400000 },
      store: new SessionStore({
        checkPeriod: 86400000,
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "mobile" },
      async (mobile, password, done) => {
        try {
          const user = await storage.getUserByMobile(mobile);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "رقم الجوال أو كلمة المرور غير صحيحة" });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

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
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { mobile, newPassword } = req.body;
      const user = await storage.getUserByMobile(mobile);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
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
      const existingMobile = await storage.getUserByMobile(input.mobile);
      if (existingMobile) {
        return res.status(400).json({ message: "رقم الجوال مسجل مسبقاً" });
      }
      if (input.email) {
        const existingEmail = await usersCollection.findOne({ email: input.email });
        if (existingEmail) {
          return res.status(400).json({ message: "البريد الإلكتروني مسجل مسبقاً" });
        }
      }
      const hashedPassword = await hashPassword(input.password);
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

      // Return callback URL for mock payment
      const callbackUrl = `/api/donations/callback?ref=${geideaRef}&status=success`;
      res.json({ redirectUrl: callbackUrl, donationId: donation.id });
    } catch (err) {
      console.error("Donation creation error:", err);
      res.status(500).json({ message: "خطأ في إنشاء التبرع" });
    }
  });

  app.get(api.donations.callback.path, async (req, res) => {
    const { ref, status } = req.query;
    if (typeof ref !== 'string' || typeof status !== 'string') {
      return res.status(400).send("طلب غير صالح");
    }

    const donation = await storage.updateDonationStatus(ref, status === 'success' ? 'confirmed' : 'failed');
    
    if (donation && donation.userId && status === 'success') {
      // Points and total donations are now updated in storage.updateDonationStatus
      
      // Get user for email
      const user = await storage.getUser(donation.userId);
      if (user?.email) {
        const template = emailTemplates.donationReceived(donation.donorName || user.name || "فاعل خير", String(donation.amount));
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html
        });
      }

      // Create certificate and invoice
      const certId = new ObjectId();
      await db.collection("certificates").insertOne({
        _id: certId,
        donationId: donation.id,
        userId: donation.userId ? new ObjectId(String(donation.userId)) : null,
        donorName: donation.donorName || "فاعل خير", 
        amount: donation.amount,
        type: donation.type,
        certificateNumber: `TQ-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`,
        createdAt: new Date()
      });

      await db.collection("invoices").insertOne({
        donationId: donation.id,
        userId: donation.userId ? new ObjectId(String(donation.userId)) : null,
        donorName: donation.donorName || "فاعل خير",
        amount: donation.amount,
        type: donation.type,
        paymentMethod: (donation as any).paymentMethod || "online",
        invoiceNumber: `INV-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`,
        createdAt: new Date()
      });
    }

    res.redirect("/profile?payment=success");
  });

  app.get(api.donations.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const donations = await storage.getDonations((req.user as any).id);
    res.json(donations);
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

  // ==================== BANK TRANSFER ROUTES ====================
  app.post("/api/bank-transfers", upload.single("file"), async (req, res) => {
    try {
      const { amount, type, bankName, transferDate, donorName, donorPhone } = req.body;
      const receiptImage = req.file ? `/uploads/${req.file.filename}` : req.body.receiptImage;
      
      const transfer = await db.collection("bank_transfers").insertOne({
        amount,
        type,
        bankName,
        transferDate,
        receiptImage,
        donorName,
        donorPhone,
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
        res.json({ message: "تم إرسال البريد بنجاح" });
      } else {
        console.error("Admin email sending failed:", result.error);
        res.status(500).json({ message: "فشل إرسال البريد", error: String(result.error) });
      }
    } catch (err) {
      console.error("Admin email route error:", err);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // ==================== CONTENT MANAGEMENT ====================
  app.get("/api/admin/content", requireRole("admin", "manager"), async (req, res) => {
    try {
      const content = await storage.getAllContent();
      res.json(content);
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب المحتوى" });
    }
  });

  app.put("/api/admin/content/:slug", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { slug } = req.params;
      const content = await storage.updateContent(slug, req.body);
      res.json(content);
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث المحتوى" });
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
      const donations = await donationsCollection.find({ status: "success" }).toArray();
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
    const topDonors = await storage.getTopDonors();
    res.json(topDonors.map((d: any) => ({ ...d, totalDonations: String(d.totalDonations) })));
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

  // ==================== JOBS MANAGEMENT ====================
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await db.collection("jobs").find({}).toArray();
      res.json(jobs.map((j: any) => ({ ...j, id: j._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الوظائف" });
    }
  });

  app.post("/api/jobs", requireRole("admin", "manager"), async (req, res) => {
    try {
      const job = req.body;
      const result = await db.collection("jobs").insertOne({
        ...job,
        createdAt: new Date()
      });
      res.status(201).json({ id: result.insertedId });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إضافة الوظيفة" });
    }
  });

  app.put("/api/jobs/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { id } = req.params;
      const update = req.body;
      await db.collection("jobs").updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...update, updatedAt: new Date() } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الوظيفة" });
    }
  });

  app.delete("/api/jobs/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      const { id } = req.params;
      await db.collection("jobs").deleteOne({ _id: new ObjectId(id) });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف الوظيفة" });
    }
  });

  // ==================== NEWS ARTICLES ====================
  app.get("/api/news", async (req, res) => {
    try {
      const news = await db.collection("news")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      const normalizedNews = news.map(article => ({
        ...article,
        id: article._id.toString(),
        _id: undefined
      }));
      res.json(normalizedNews);
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الأخبار" });
    }
  });

  app.post("/api/news", requireRole("admin"), async (req, res) => {
    try {
      const { title, titleEn, content, contentEn, summary, summaryEn, imageUrl, category, isPublished } = req.body;
      if (!title) {
        return res.status(400).json({ message: "العنوان مطلوب" });
      }
      const article = {
        title,
        titleEn,
        content,
        contentEn,
        summary,
        summaryEn,
        imageUrl,
        category: category || "general",
        isPublished: isPublished ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection("news").insertOne(article);
      res.json({ ...article, id: result.insertedId.toString() });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إضافة الخبر" });
    }
  });

  app.put("/api/news/:id", requireRole("admin"), async (req, res) => {
    try {
      const id = String(req.params.id);
      const { title, titleEn, content, contentEn, summary, summaryEn, imageUrl, category, isPublished } = req.body;
      await db.collection("news").updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            title, titleEn, content, contentEn, summary, summaryEn, 
            imageUrl, category, isPublished, updatedAt: new Date() 
          } 
        }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الخبر" });
    }
  });

  app.delete("/api/news/:id", requireRole("admin"), async (req, res) => {
    try {
      const id = String(req.params.id);
      await db.collection("news").deleteOne({ _id: new ObjectId(id) });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف الخبر" });
    }
  });

  // ==================== JOB APPLICATIONS ====================
  app.get("/api/job-applications", requireRole("admin"), async (req, res) => {
    try {
      const applications = await db.collection("job_applications")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.json(applications);
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب طلبات التوظيف" });
    }
  });

  app.post("/api/job-applications", async (req, res) => {
    try {
      const { name, email, phone, jobId, jobTitle, resumeUrl, coverLetter } = req.body;
      const application = {
        name,
        email,
        phone,
        jobId,
        jobTitle,
        resumeUrl,
        coverLetter,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection("job_applications").insertOne(application);
      res.json({ ...application, id: result.insertedId });
    } catch (err) {
      res.status(500).json({ message: "خطأ في إرسال طلب التوظيف" });
    }
  });

  app.put("/api/job-applications/:id/status", requireRole("admin"), async (req, res) => {
    try {
      const { status } = req.body;
      const id = String(req.params.id);
      const validStatuses = ["pending", "reviewed", "accepted", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "حالة غير صالحة" });
      }
      await db.collection("job_applications").updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في تحديث الحالة" });
    }
  });

  app.delete("/api/job-applications/:id", requireRole("admin"), async (req, res) => {
    try {
      const id = String(req.params.id);
      await db.collection("job_applications").deleteOne({ _id: new ObjectId(id) });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حذف الطلب" });
    }
  });

  // ==================== FILE UPLOAD ====================
  app.use("/uploads", express.static(uploadDir));

  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "لم يتم اختيار ملف" });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl, fileName: req.file.filename });
    } catch (err) {
      res.status(500).json({ message: "خطأ في رفع الملف" });
    }
  });

  app.get("/api/uploads/:id", async (req, res) => {
    try {
      const uploadId = String(req.params.id);
      const upload = await db.collection("uploads").findOne({ _id: new ObjectId(uploadId) });
      if (!upload) return res.status(404).json({ message: "الملف غير موجود" });
      const base64Data = upload.image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      res.set("Content-Type", "image/png");
      res.send(buffer);
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الملف" });
    }
  });

  // ==================== SITE SETTINGS ====================
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await db.collection("settings").findOne({});
      res.json(settings || {});
    } catch (err) {
      res.status(500).json({ message: "خطأ في جلب الإعدادات" });
    }
  });

  app.put("/api/settings", requireRole("admin"), async (req, res) => {
    try {
      await db.collection("settings").updateOne(
        {},
        { $set: { ...req.body, updatedAt: new Date() } },
        { upsert: true }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "خطأ في حفظ الإعدادات" });
    }
  });

  return httpServer;
}
