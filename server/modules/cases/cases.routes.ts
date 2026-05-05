import { Router, Request, Response } from "express";
import { CaseForm, CaseSubmission } from "./cases.model";
import { ai, AI_MODEL } from "../../core/ai";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// [PCI DSS 6.2.4] Never expose internal error details in responses
const safeError = (res: Response, e: any) => {
  console.error("[cases] Internal error:", e?.message || e);
  return res.status(500).json({ error: "خطأ داخلي — يرجى المحاولة مرة أخرى" });
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "client/public/uploads/cases");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `case-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "غير مصرح" });
  next();
}
function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "غير مصرح" });
  const role = (req.user as any)?.role;
  if (!["admin", "manager"].includes(role)) return res.status(403).json({ error: "ممنوع" });
  next();
}
function requireEmployee(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "غير مصرح" });
  const role = (req.user as any)?.role;
  if (!["admin", "manager", "employee"].includes(role)) return res.status(403).json({ error: "ممنوع" });
  next();
}

// ── Admin: CRUD for forms ──────────────────────────────────────────────────

router.get("/admin/case-forms", requireAdmin, async (_req, res) => {
  try {
    const forms = await CaseForm.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (e) {
    res.status(500).json({ error: "خطأ في جلب النماذج" });
  }
});

router.post("/admin/case-forms", requireAdmin, async (req, res) => {
  try {
    const { title, description, questions, isActive } = req.body;
    if (!title) return res.status(400).json({ error: "العنوان مطلوب" });
    const slug = title
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, "")
      + "-" + Date.now();
    const form = await CaseForm.create({ title, slug, description, questions: questions || [], isActive: isActive !== false });
    res.json(form);
  } catch (e: any) {
    return safeError(res, e);
  }
});

router.put("/admin/case-forms/:id", requireAdmin, async (req, res) => {
  try {
    const form = await CaseForm.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!form) return res.status(404).json({ error: "النموذج غير موجود" });
    res.json(form);
  } catch (e: any) {
    return safeError(res, e);
  }
});

router.delete("/admin/case-forms/:id", requireAdmin, async (req, res) => {
  try {
    await CaseForm.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "خطأ في الحذف" });
  }
});

// ── Public: Get active forms ───────────────────────────────────────────────

router.get("/case-forms", async (_req, res) => {
  try {
    const forms = await CaseForm.find({ isActive: true }).select("title slug description submissionsCount");
    res.json(forms);
  } catch (e) {
    res.status(500).json({ error: "خطأ" });
  }
});

router.get("/case-forms/:slug", async (req, res) => {
  try {
    const form = await CaseForm.findOne({ slug: req.params.slug, isActive: true });
    if (!form) return res.status(404).json({ error: "النموذج غير موجود أو غير نشط" });
    res.json(form);
  } catch (e) {
    res.status(500).json({ error: "خطأ" });
  }
});

// ── Public: Submit a case ──────────────────────────────────────────────────

router.post("/case-forms/:slug/submit", upload.any(), async (req, res) => {
  try {
    const form = await CaseForm.findOne({ slug: req.params.slug, isActive: true });
    if (!form) return res.status(404).json({ error: "النموذج غير موجود" });

    let answers: Record<string, any> = {};
    try { answers = JSON.parse(req.body.answers || "{}"); } catch { answers = req.body; }

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        // [PCI DSS 6.2.4] Sanitize fieldname to prevent prototype pollution / property injection
        const safeFieldname = String(file.fieldname)
          .replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "")
          .slice(0, 100);
        if (safeFieldname && safeFieldname !== "__proto__" && safeFieldname !== "constructor" && safeFieldname !== "prototype") {
          answers[safeFieldname] = `/uploads/cases/${file.filename}`;
        }
      }
    }

    let location = undefined;
    if (req.body.lat && req.body.lng) {
      location = { lat: parseFloat(req.body.lat), lng: parseFloat(req.body.lng), address: req.body.address || "" };
    }

    const submission = await CaseSubmission.create({
      formId: form._id,
      formTitle: form.title,
      formSlug: form.slug,
      answers,
      location,
      status: "new",
    });

    await CaseForm.findByIdAndUpdate(form._id, { $inc: { submissionsCount: 1 } });

    res.json({ ok: true, id: submission._id });
  } catch (e: any) {
    return safeError(res, e);
  }
});

// ── Employee: View submissions ─────────────────────────────────────────────

router.get("/employee/cases", requireEmployee, async (req, res) => {
  try {
    const { status, formSlug, page = "1", limit = "20" } = req.query as Record<string, string>;
    const filter: any = {};
    if (status) filter.status = status;
    if (formSlug) filter.formSlug = formSlug;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      CaseSubmission.find(filter).sort({ submittedAt: -1 }).skip(skip).limit(parseInt(limit)),
      CaseSubmission.countDocuments(filter),
    ]);
    res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) {
    res.status(500).json({ error: "خطأ في جلب الحالات" });
  }
});

router.get("/employee/cases/:id", requireEmployee, async (req, res) => {
  try {
    const sub = await CaseSubmission.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: "الحالة غير موجودة" });
    res.json(sub);
  } catch (e) {
    res.status(500).json({ error: "خطأ" });
  }
});

router.patch("/employee/cases/:id/status", requireEmployee, async (req, res) => {
  try {
    const { status, employeeNotes } = req.body;
    const user = req.user as any;
    const sub = await CaseSubmission.findByIdAndUpdate(
      req.params.id,
      { status, employeeNotes, reviewedAt: new Date(), reviewedBy: user?.name || "موظف" },
      { new: true }
    );
    if (!sub) return res.status(404).json({ error: "الحالة غير موجودة" });
    res.json(sub);
  } catch (e: any) {
    return safeError(res, e);
  }
});

// ── Employee: AI analysis of a submission ─────────────────────────────────

router.post("/employee/cases/:id/analyze", requireEmployee, async (req, res) => {
  try {
    const sub = await CaseSubmission.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: "الحالة غير موجودة" });

    const answersText = Object.entries(sub.answers)
      .map(([k, v]) => `- ${k}: ${typeof v === "string" && v.startsWith("/uploads") ? "[ملف مرفق]" : v}`)
      .join("\n");

    const locationText = sub.location
      ? `\nالموقع الجغرافي: خط العرض ${sub.location.lat}، خط الطول ${sub.location.lng}${sub.location.address ? " — " + sub.location.address : ""}`
      : "";

    const prompt = `أنت موظف اجتماعي في جمعية طويق للخدمات الإنسانية. تلقيت حالة إنسانية جديدة بعنوان: "${sub.formTitle}".
بيانات الحالة:
${answersText}${locationText}

قم بـ:
1. تقييم مدى الاحتياج (عاجل / متوسط / طبيعي)
2. ملخص سريع للحالة بجملتين
3. التوصية: ما هو الإجراء المناسب؟
4. تحذير إن وجدت معلومات ناقصة أو مشبوهة

الرد يجب أن يكون عملياً ومنظماً ومختصراً.`;

    const completion = await ai.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.4,
    });

    const aiAnalysis = completion.choices[0]?.message?.content ?? "تعذّر التحليل.";
    await CaseSubmission.findByIdAndUpdate(req.params.id, { aiAnalysis });
    res.json({ aiAnalysis });
  } catch (e: any) {
    return safeError(res, e);
  }
});

// ── Admin: Stats ───────────────────────────────────────────────────────────

router.get("/admin/cases/stats", requireAdmin, async (_req, res) => {
  try {
    const [total, newCount, accepted, rejected, forms] = await Promise.all([
      CaseSubmission.countDocuments(),
      CaseSubmission.countDocuments({ status: "new" }),
      CaseSubmission.countDocuments({ status: "accepted" }),
      CaseSubmission.countDocuments({ status: "rejected" }),
      CaseForm.countDocuments({ isActive: true }),
    ]);
    res.json({ total, new: newCount, accepted, rejected, activeForms: forms });
  } catch (e) {
    res.status(500).json({ error: "خطأ" });
  }
});

export default router;
