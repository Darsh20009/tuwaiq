import mongoose from "mongoose";
import { PaymentModel, IPayment } from "../../models/Payment.model";
import { DonationModel } from "../../models/Donation.model";
import { initiateRajhiPayment, verifyRajhiCallback, inquireRajhiPayment } from "../../rajhi";
import { updateDonationStatus, createDonation, getDonationById } from "../donations/donations.service";
import { sendEmail } from "../../mail";
import { ValidationError } from "../../core/errors";
import { db } from "../../db";

async function getSiteSettings(): Promise<Record<string, any>> {
  try {
    const settings = await db.collection("settings").findOne({});
    return settings || {};
  } catch {
    return {};
  }
}

// ========== Al Rajhi (Neoleap) ==========
export async function initiateRajhi(params: {
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donationType: string;
  userId?: string;
  campaignId?: string;
}): Promise<{ redirectUrl: string; donationId: string }> {
  const siteSettings = await getSiteSettings();
  const tranportalId       = siteSettings.rajhiTranportalId       || process.env.RAJHI_TRANPORTAL_ID;
  const tranportalPassword = siteSettings.rajhiTranportalPassword || process.env.RAJHI_TRANPORTAL_PASSWORD;
  const resourceKey        = siteSettings.rajhiResourceKey        || process.env.RAJHI_RESOURCE_KEY;

  if (!tranportalId || !tranportalPassword || !resourceKey) {
    throw new ValidationError("إعدادات بوابة الراجحي غير مكتملة");
  }

  const donation = await createDonation({
    amount: params.amount,
    type: params.donationType,
    paymentMethod: "rajhi",
    donorName: params.donorName,
    donorEmail: params.donorEmail,
    donorPhone: params.donorPhone,
    userId: params.userId,
    campaignId: params.campaignId,
  });

  const donationId = (donation._id as any).toString();

  // Always use the production domain for Al Rajhi callbacks.
  // REPLIT_DEV_DOMAIN is only for dev previews — using it would send callbacks
  // to an ephemeral URL that may change on restart, causing lost payments.
  const baseUrl =
    process.env.BASE_URL ||
    "https://tuwaiqassociation.sa";
  const callbackUrl = `${baseUrl}/api/donations/rajhi-callback`;
  console.log("[Rajhi] Callback URL:", callbackUrl);

  // Server-to-server JSON API call → get PaymentID → return browser redirect URL
  const result = await initiateRajhiPayment({
    tranportalId,
    tranportalPassword,
    resourceKey,
    amountSAR: params.amount,
    orderId: donationId,
    approvalUrl: callbackUrl,
    errorUrl: callbackUrl,
  });

  await DonationModel.findByIdAndUpdate(donation._id, {
    rajhiRef: result.paymentId,
  });

  await PaymentModel.create({
    donationId: donation._id,
    provider: "rajhi",
    transactionId: result.paymentId,
    amount: params.amount,
    status: "pending",
  });

  return { redirectUrl: result.redirectUrl, donationId };
}

export async function handleRajhiCallback(body: any): Promise<boolean> {
  const siteSettings = await getSiteSettings();
  const resourceKey = siteSettings.rajhiResourceKey || process.env.RAJHI_RESOURCE_KEY;
  if (!resourceKey) return false;

  const result = verifyRajhiCallback(body, resourceKey);
  const orderId = result.orderId
    || body.OrderID || body.orderId
    || body.trackId || body.trackid || body.TrackID
    || body.ref     || body.Ref;

  if (!orderId) return false;

  let finalSuccessful = result.successful;

  // CRITICAL: Never mark as failed without inquiry confirmation from Rajhi.
  // Callback decryption failures or unclear results should always be verified
  // via direct inquiry (action 8) before marking a donation as failed.
  if (!result.successful) {
    try {
      const tranportalId       = siteSettings.rajhiTranportalId       || process.env.RAJHI_TRANPORTAL_ID || "";
      const tranportalPassword = siteSettings.rajhiTranportalPassword || process.env.RAJHI_TRANPORTAL_PASSWORD || "";
      const baseUrl = process.env.BASE_URL || "https://tuwaiqassociation.sa";
      const cbUrl   = `${baseUrl}/api/donations/rajhi-callback`;
      if (tranportalId && tranportalPassword && resourceKey) {
        const donationForInq = await getDonationById(orderId);
        const rajhiRef = (donationForInq as any)?.rajhiRef;
        const inq = await inquireRajhiPayment({
          tranportalId, tranportalPassword, resourceKey, orderId,
          paymentId: rajhiRef && rajhiRef !== orderId ? rajhiRef : undefined,
          errorUrl: cbUrl, responseUrl: cbUrl,
        });
        console.warn("[payments.service] Inquiry for", orderId, "→", inq.queried, inq.successful, inq.result);
        if (inq.queried) {
          finalSuccessful = inq.successful;
        } else {
          // Could not reach Rajhi — leave as pending, never mark failed
          console.warn("[payments.service] Rajhi callback unverified for", orderId, "— leaving pending");
          return false;
        }
      } else {
        console.warn("[payments.service] Missing credentials for inquiry — leaving pending");
        return false;
      }
    } catch (e) {
      console.error("[payments.service] Inquiry error:", (e as Error).message, "— leaving pending");
      return false;
    }
  }

  // SAFETY: never mark as failed — only confirmed or leave as pending
  if (!finalSuccessful) {
    console.warn("[payments.service] Payment not confirmed for", orderId, "— leaving pending");
    return false;
  }
  const status = "confirmed";
  const updated = await updateDonationStatus({ _id: orderId }, status);

  await PaymentModel.findOneAndUpdate(
    { transactionId: orderId, provider: "rajhi" },
    {
      status: "success",
      paidAt: new Date(),
    }
  );

  if (result.successful && updated?.donorEmail) {
    await sendEmail({
      to: updated.donorEmail,
      subject: "تأكيد تبرعك - جمعية طويق",
      html: `<div dir="rtl"><h2>شكراً لتبرعك</h2><p>تم استلام تبرعك بمبلغ ${updated?.amount} ريال.</p></div>`,
    }).catch(() => {});
  }

  return result.successful;
}

// ========== Bank Transfer ==========
export async function initiateBankTransfer(params: {
  amount: number;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  donationType: string;
  bankTransferPhoto?: string;
  userId?: string;
  campaignId?: string;
}): Promise<{ donationId: string; message: string }> {
  const donation = await createDonation({
    amount: params.amount,
    type: params.donationType,
    paymentMethod: "bank_transfer",
    donorName: params.donorName,
    donorEmail: params.donorEmail,
    donorPhone: params.donorPhone,
    userId: params.userId,
    campaignId: params.campaignId,
  });

  if (params.bankTransferPhoto) {
    await DonationModel.findByIdAndUpdate(donation._id, { bankTransferPhoto: params.bankTransferPhoto });
  }

  await PaymentModel.create({
    donationId: donation._id,
    provider: "bank_transfer",
    amount: params.amount,
    status: "pending",
  });

  if (params.donorEmail) {
    await sendEmail({
      to: params.donorEmail,
      subject: "استلام طلب التحويل البنكي - جمعية طويق",
      html: `<div dir="rtl"><h2>شكراً ${params.donorName}</h2><p>تم استلام طلب التحويل البنكي بمبلغ ${params.amount} ريال.</p><p>سيتم مراجعة التحويل وتأكيده خلال 24 ساعة.</p></div>`,
    }).catch(() => {});
  }

  return {
    donationId: (donation._id as any).toString(),
    message: "تم إرسال طلب التحويل البنكي بنجاح، سيتم مراجعته وتأكيده",
  };
}

export async function getPayments(filter?: { provider?: string; status?: string }): Promise<IPayment[]> {
  const query: any = {};
  if (filter?.provider) query.provider = filter.provider;
  if (filter?.status) query.status = filter.status;
  return PaymentModel.find(query).sort({ createdAt: -1 }).populate("donationId");
}
