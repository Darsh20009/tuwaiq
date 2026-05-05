import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { DonationModel, IDonation } from "../../models/Donation.model";
import { CampaignModel } from "../../models/Campaign.model";
import { UserModel } from "../../models/User.model";
import { NotFoundError, ValidationError } from "../../core/errors";
import { randomBytes } from "crypto";
import { db } from "../../db";
import { sendEmail, emailTemplates } from "../../mail";
import { generateCertificatePDF, generateInvoicePDF } from "../../pdf";
import { fireNotify, fireNotifyAdmins } from "../../core/notifications";
import { sendPurchaseCAPIEvents } from "../../capi";

function computeLevel(total: number): string {
  if (total >= 100000) return "diamond";
  if (total >= 50000) return "platinum";
  if (total >= 10000) return "gold";
  if (total >= 1000) return "silver";
  return "bronze";
}

function computeBadges(count: number, total: number): string[] {
  const badges: string[] = [];
  if (count >= 1) badges.push("first_donor");
  if (count >= 5) badges.push("regular_donor");
  if (count >= 20) badges.push("loyal_donor");
  if (total >= 1000) badges.push("silver_heart");
  if (total >= 10000) badges.push("gold_heart");
  if (total >= 50000) badges.push("platinum_heart");
  return badges;
}

export async function createDonation(data: {
  amount: number;
  type?: string;
  paymentMethod?: string;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  userId?: string;
  campaignId?: string;
  currency?: string;
}): Promise<IDonation> {
  const amount = Number(data.amount);
  if (!amount || amount < 1) throw new ValidationError("الحد الأدنى للتبرع ريال واحد");
  if (amount > 1000000) throw new ValidationError("المبلغ لا يتجاوز مليون ريال");

  const pointsEarned = Math.floor(amount * 10);
  const certificateId = randomBytes(8).toString("hex").toUpperCase();
  const receiptId = `REC-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`;

  const donationData: any = {
    amount,
    currency: data.currency || "SAR",
    type: data.type || "general",
    paymentMethod: data.paymentMethod,
    status: "pending",
    paymentStatus: "pending",
    donorName: data.donorName,
    donorEmail: data.donorEmail,
    donorPhone: data.donorPhone,
    pointsEarned,
    certificateId,
    receiptId,
  };

  if (data.userId && mongoose.Types.ObjectId.isValid(data.userId)) {
    donationData.userId = new mongoose.Types.ObjectId(data.userId);
    donationData.donorId = new mongoose.Types.ObjectId(data.userId);
  }

  if (data.campaignId && mongoose.Types.ObjectId.isValid(data.campaignId)) {
    donationData.campaignId = new mongoose.Types.ObjectId(data.campaignId);
  }

  const donation = await DonationModel.create(donationData);
  return donation;
}

export async function confirmDonation(donationId: string, ref?: string): Promise<IDonation> {
  const donation = await DonationModel.findById(donationId);
  if (!donation) throw new NotFoundError("التبرع");

  const update: any = { status: "confirmed", paymentStatus: "confirmed" };

  await donation.updateOne(update);

  // Update campaign progress
  if (donation.campaignId) {
    await CampaignModel.findByIdAndUpdate(donation.campaignId, {
      $inc: { currentAmount: donation.amount },
    });
  }

  // Update user stats
  if (donation.userId) {
    const user = await UserModel.findById(donation.userId);
    if (user) {
      const newTotal = (user.totalDonations || 0) + donation.amount;
      const newCount = (user.donationCount || 0) + 1;
      const newPoints = (user.points || 0) + donation.pointsEarned;
      const newLevel = computeLevel(newTotal);
      const newBadges = computeBadges(newCount, newTotal);
      await UserModel.findByIdAndUpdate(donation.userId, {
        totalDonations: newTotal,
        donationCount: newCount,
        points: newPoints,
        level: newLevel,
        badges: newBadges,
      });
    }
  }

  const updated = await DonationModel.findById(donationId);
  return updated!;
}

export async function updateDonationStatus(filter: Record<string, any>, status: string): Promise<IDonation | null> {
  const donation = await DonationModel.findOne(filter);
  if (!donation) return null;

  // Guard: don't double-confirm an already confirmed donation
  if (status === "confirmed" && (donation as any).status === "confirmed") {
    console.log("[Donations] Already confirmed, skipping:", donation._id.toString());
    return donation;
  }

  await donation.updateOne({ status, paymentStatus: status });

  if (status === "confirmed") {
    // Update campaign progress
    if (donation.campaignId) {
      await CampaignModel.findByIdAndUpdate(donation.campaignId, {
        $inc: { currentAmount: donation.amount },
      });
    }

    // Always notify admins on every confirmed donation
    const adminDonorName = (donation as any).donorName || "فاعل خير";
    fireNotifyAdmins("💰 تبرع جديد مؤكد", `${adminDonorName} تبرع بمبلغ ${donation.amount} ريال`, {
      type: "success", link: "/admin/donations", icon: "💰", push: true,
    }).catch(() => {});

    // Update user stats + points
    if (donation.userId) {
      const user = await UserModel.findById(donation.userId);
      if (user) {
        const newTotal = (user.totalDonations || 0) + donation.amount;
        const newCount = (user.donationCount || 0) + 1;
        const newPoints = (user.points || 0) + (donation as any).pointsEarned;
        await UserModel.findByIdAndUpdate(donation.userId, {
          totalDonations: newTotal,
          donationCount: newCount,
          points: newPoints,
          level: computeLevel(newTotal),
          badges: computeBadges(newCount, newTotal),
        });

        // Generate PDFs for attachment
        const donorName = (donation as any).donorName || user?.name || "فاعل خير";
        const donationType = (donation as any).type || "general";
        const certNumber = (donation as any).certificateId ||
          `TQ-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;
        const invNumber = (donation as any).receiptId ||
          `INV-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;

        let pdfAttachments: { filename: string; content: Buffer; contentType: string }[] = [];
        try {
          const [certBuf, invBuf] = await Promise.all([
            generateCertificatePDF({ donorName, amount: donation.amount, type: donationType, certificateNumber: certNumber }),
            generateInvoicePDF({ donorName, amount: donation.amount, type: donationType, invoiceNumber: invNumber, receiptId: (donation as any).receiptId }),
          ]);
          pdfAttachments = [
            { filename: `شهادة-تبرع-${certNumber}.pdf`, content: certBuf, contentType: "application/pdf" },
            { filename: `فاتورة-${invNumber}.pdf`, content: invBuf, contentType: "application/pdf" },
          ];
        } catch (pdfErr) {
          console.error("[Donations] PDF generation failed:", (pdfErr as Error).message);
        }

        // Send confirmation email to registered user
        try {
          const emailTo = user?.email || (donation as any).donorEmail;
          if (emailTo) {
            const tpl = emailTemplates.donationReceived(donorName, String(donation.amount), donationType, certNumber);
            await sendEmail({ to: emailTo, subject: tpl.subject, html: tpl.html, attachments: pdfAttachments });
          }
        } catch (mailErr) {
          console.error("[Donations] Email send failed:", (mailErr as Error).message);
        }

        // Push notification to the donor (if registered)
        if (donation.userId) {
          fireNotify(donation.userId.toString(), "✅ تم تأكيد تبرعك", `تبرعك بمبلغ ${donation.amount} ريال تم قبوله. جزاك الله خيراً.`, {
            type: "success", link: "/my-donations", icon: "✅", push: true,
          }).catch(() => {});
        }

      }
    } else if ((donation as any).donorEmail) {
      // Guest donor (no userId) — generate PDFs and send confirmation to donorEmail directly
      try {
        const donorName = (donation as any).donorName || "فاعل خير";
        const donationType = (donation as any).type || "general";
        const certNumber = (donation as any).certificateId ||
          `TQ-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;
        const invNumber = (donation as any).receiptId ||
          `INV-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;

        let pdfAttachments: { filename: string; content: Buffer; contentType: string }[] = [];
        try {
          const [certBuf, invBuf] = await Promise.all([
            generateCertificatePDF({ donorName, amount: donation.amount, type: donationType, certificateNumber: certNumber }),
            generateInvoicePDF({ donorName, amount: donation.amount, type: donationType, invoiceNumber: invNumber, receiptId: (donation as any).receiptId }),
          ]);
          pdfAttachments = [
            { filename: `شهادة-تبرع-${certNumber}.pdf`, content: certBuf, contentType: "application/pdf" },
            { filename: `فاتورة-${invNumber}.pdf`, content: invBuf, contentType: "application/pdf" },
          ];
        } catch (pdfErr) {
          console.error("[Donations] PDF generation failed:", (pdfErr as Error).message);
        }

        const tpl = emailTemplates.donationReceived(donorName, String(donation.amount), donationType, certNumber);
        await sendEmail({ to: (donation as any).donorEmail, subject: tpl.subject, html: tpl.html, attachments: pdfAttachments });
        console.log("[Donations] Guest email + PDFs sent to:", (donation as any).donorEmail);
      } catch (mailErr) {
        console.error("[Donations] Guest email send failed:", (mailErr as Error).message);
      }
    }

    // Create certificate record in native MongoDB collection
    try {
      const existingCert = await db.collection("certificates").findOne({
        donationId: donation._id.toString(),
      });
      if (!existingCert) {
        await db.collection("certificates").insertOne({
          _id: new ObjectId(),
          donationId: donation._id.toString(),
          userId: donation.userId ? new ObjectId(donation.userId.toString()) : null,
          donorName: (donation as any).donorName || "فاعل خير",
          amount: donation.amount,
          type: (donation as any).type || "general",
          certificateNumber: (donation as any).certificateId ||
            `TQ-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`,
          createdAt: new Date(),
        });
      }
    } catch (certErr) {
      console.error("[Donations] Certificate creation failed:", (certErr as Error).message);
    }

    // Create invoice record in native MongoDB collection
    try {
      const existingInv = await db.collection("invoices").findOne({
        donationId: donation._id.toString(),
      });
      if (!existingInv) {
        await db.collection("invoices").insertOne({
          donationId: donation._id.toString(),
          userId: donation.userId ? new ObjectId(donation.userId.toString()) : null,
          donorName: (donation as any).donorName || "فاعل خير",
          amount: donation.amount,
          type: (donation as any).type || "general",
          paymentMethod: "online",
          invoiceNumber: (donation as any).receiptId ||
            `INV-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`,
          createdAt: new Date(),
        });
      }
    } catch (invErr) {
      console.error("[Donations] Invoice creation failed:", (invErr as Error).message);
    }

    // Fire server-side CAPI Purchase event (Facebook + Snapchat).
    // eventId = donationId — same value sent to browser pixel for deduplication.
    // Runs fire-and-forget so it never blocks the confirmation flow.
    sendPurchaseCAPIEvents({
      eventId: donation._id.toString(),
      amount: donation.amount,
      currency: (donation as any).currency || "SAR",
      donorEmail: (donation as any).donorEmail,
      donorPhone: (donation as any).donorPhone,
      donationType: (donation as any).type,
    }).catch((e) => console.error("[CAPI] Event send failed:", e.message));
  }

  return DonationModel.findOne(filter);
}

export async function getDonations(query: {
  userId?: string;
  campaignId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ donations: IDonation[]; total: number }> {
  const filter: any = { isDeleted: { $ne: true } };
  if (query.userId && mongoose.Types.ObjectId.isValid(query.userId)) filter.userId = new mongoose.Types.ObjectId(query.userId);
  if (query.campaignId && mongoose.Types.ObjectId.isValid(query.campaignId)) filter.campaignId = new mongoose.Types.ObjectId(query.campaignId);
  if (query.status) filter.status = query.status;

  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const [donations, total] = await Promise.all([
    DonationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    DonationModel.countDocuments(filter),
  ]);

  return { donations, total };
}

export async function getDonationById(id: string): Promise<IDonation | null> {
  return DonationModel.findById(id);
}

export async function getDonationsByCampaign(campaignId: string): Promise<IDonation[]> {
  return DonationModel.find({
    campaignId: new mongoose.Types.ObjectId(campaignId),
    isDeleted: { $ne: true },
  }).sort({ createdAt: -1 });
}

export async function getTopDonors(limit: number = 10): Promise<any[]> {
  return UserModel.find({ isPublicDonor: true, totalDonations: { $gt: 0 } })
    .sort({ totalDonations: -1 })
    .limit(limit)
    .select("name totalDonations level badges donationCount");
}

export async function getDonationStats(): Promise<any> {
  const successStatuses = ["confirmed", "success"];
  const [total, confirmed, pending, totalAmount] = await Promise.all([
    DonationModel.countDocuments({ isDeleted: { $ne: true } }),
    DonationModel.countDocuments({ status: { $in: successStatuses }, isDeleted: { $ne: true } }),
    DonationModel.countDocuments({ status: "pending", isDeleted: { $ne: true } }),
    DonationModel.aggregate([
      { $match: { status: { $in: successStatuses }, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  return {
    total,
    confirmed,
    pending,
    totalAmount: totalAmount[0]?.total || 0,
  };
}

export async function softDeleteDonation(id: string): Promise<void> {
  const donation = await DonationModel.findById(id);
  if (donation) {
    // If confirmed, reverse the user's total and count
    if (
      (donation.status === "confirmed" || donation.status === "success") &&
      donation.userId
    ) {
      try {
        const amount = Number(donation.amount) || 0;
        await UserModel.findByIdAndUpdate(donation.userId, {
          $inc: { totalDonations: -amount, donationCount: -1 },
        });
      } catch (_) { /* user may not exist */ }
    }
    await donation.updateOne({ isDeleted: true });
  }
}

export async function getDeletedDonations(): Promise<IDonation[]> {
  return DonationModel.find({ isDeleted: true }).sort({ createdAt: -1 });
}
