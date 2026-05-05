import { Router } from "express";
import { requireAuth } from "../../core/auth.middleware";
import { RecurringDonationModel } from "../../models/RecurringDonation.model";
import { initiateRajhi } from "../payments/payments.service";
import { sendEmail } from "../../mail";

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcNextDate(frequency: "daily" | "monthly", from: Date = new Date()): Date {
  const next = new Date(from);
  if (frequency === "daily") next.setDate(next.getDate() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

async function sendPaymentLinkEmail(opts: {
  email: string;
  name: string;
  amount: number;
  paymentUrl: string;
  chargesRemaining: number;
  durationLabel: string;
}) {
  const { email, name, amount, paymentUrl, chargesRemaining, durationLabel } = opts;
  const subject = `رابط تبرعك المتكرر — جمعية طويق`;
  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#2d6a4f">السلام عليكم ${name} 🌿</h2>
      <p>حان موعد تبرعك المتكرر لدى <strong>جمعية طويق للخدمات الإنسانية</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9">المبلغ</td>
            <td style="padding:8px;border:1px solid #ddd"><strong>${amount} ريال سعودي</strong></td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9">الدفعات المتبقية</td>
            <td style="padding:8px;border:1px solid #ddd"><strong>${chargesRemaining} ${durationLabel}</strong></td></tr>
      </table>
      <a href="${paymentUrl}"
         style="display:inline-block;padding:14px 32px;background:#2d6a4f;color:#fff;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold">
        ادفع الآن عبر الراجحي
      </a>
      <p style="color:#888;font-size:12px;margin-top:24px">جزاك الله خيراً — كتب الله أجركم</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
}

// ─── Core processor (also used by the scheduler) ─────────────────────────────

export async function processDueRecurring(): Promise<{ processed: number; errors: number }> {
  const now = new Date();
  const due = await RecurringDonationModel.find({
    status: "active",
    nextChargeDate: { $lte: now },
    chargesRemaining: { $gt: 0 },
    donorEmail: { $exists: true, $ne: "" },
  });

  let processed = 0;
  let errors = 0;

  for (const item of due) {
    try {
      const { redirectUrl } = await initiateRajhi({
        amount: item.amount,
        donorName: item.donorName || "متبرع كريم",
        donorEmail: item.donorEmail || "",
        donorPhone: item.donorPhone || "",
        donationType: item.type || "general",
        userId: item.userId?.toString(),
        campaignId: item.campaignId?.toString(),
      });

      const durationLabel = item.frequency === "daily" ? "يوم" : "شهر";

      await sendPaymentLinkEmail({
        email: item.donorEmail!,
        name: item.donorName || "متبرع كريم",
        amount: item.amount,
        paymentUrl: redirectUrl,
        chargesRemaining: item.chargesRemaining,
        durationLabel,
      });

      const newRemaining = item.chargesRemaining - 1;
      const updateData: any = {
        chargeCount: item.chargeCount + 1,
        lastChargeDate: now,
        chargesRemaining: newRemaining,
        totalCharged: (item.totalCharged || 0) + item.amount,
        nextChargeDate: calcNextDate(item.frequency as "daily" | "monthly", now),
      };
      if (newRemaining <= 0) {
        updateData.status = "completed";
      }

      await RecurringDonationModel.findByIdAndUpdate(item._id, updateData);
      processed++;
      console.log(`[Recurring] Sent payment link to ${item.donorEmail} — remaining: ${newRemaining}`);
    } catch (err: any) {
      errors++;
      console.error(`[Recurring] Failed for ${item._id}:`, err.message);
    }
  }

  return { processed, errors };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/recurring
router.get("/", requireAuth, async (req, res) => {
  try {
    const items = await RecurringDonationModel.find({ userId: (req.user as any)?._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// POST /api/recurring
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      amount, type, campaignId, frequency, duration,
      paymentMethod, donorName, donorEmail, donorPhone,
    } = req.body;

    if (!amount || !frequency || !duration) {
      return res.status(400).json({ success: false, message: "المبلغ والتكرار والمدة مطلوبة" });
    }
    if (!["daily", "monthly"].includes(frequency)) {
      return res.status(400).json({ success: false, message: "نوع التكرار غير صحيح" });
    }
    const maxDuration = frequency === "daily" ? 365 : 24;
    if (duration < 1 || duration > maxDuration) {
      return res.status(400).json({ success: false, message: "المدة خارج النطاق المسموح به" });
    }

    const nextChargeDate = calcNextDate(frequency as "daily" | "monthly");

    const item = await RecurringDonationModel.create({
      userId: (req.user as any)?._id,
      amount,
      type: type || "general",
      campaignId: campaignId || undefined,
      frequency,
      duration,
      chargesRemaining: duration - 1,
      paymentMethod: paymentMethod || "rajhi",
      donorName,
      donorEmail,
      donorPhone,
      nextChargeDate,
      status: "active",
      totalCharged: 0,
      chargeCount: 0,
    });

    res.json({ success: true, data: item });
  } catch (err: any) {
    console.error("[Recurring] create error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// PATCH /api/recurring/:id
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const item = await RecurringDonationModel.findOneAndUpdate(
      { _id: req.params.id, userId: (req.user as any)?._id },
      { status },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: "لم يُعثر على الاشتراك" });
    res.json({ success: true, data: item });
  } catch {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// DELETE /api/recurring/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await RecurringDonationModel.findOneAndDelete({ _id: req.params.id, userId: (req.user as any)?._id });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// POST /api/recurring/process-due — admin-triggerable
router.post("/process-due", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env.JWT_SECRET) {
    return res.status(403).json({ success: false, message: "غير مصرح" });
  }
  try {
    const result = await processDueRecurring();
    res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "خطأ داخلي — يرجى المحاولة مرة أخرى" });
  }
});

export default router;
