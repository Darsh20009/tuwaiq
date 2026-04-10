import crypto from "crypto";
import { Request, Response } from "express";
import * as donationsService from "./donations.service";
import { initiateRajhi, initiateBankTransfer } from "../payments/payments.service";
import { handleError } from "../../core/errors";
import { db } from "../../db";
import { verifyRajhiCallback, aesEncryptVariant, inquireRajhiPayment } from "../../rajhi";
import { DonationModel } from "../../models/Donation.model";

export async function createDonation(req: Request, res: Response): Promise<void> {
  try {
    const currentUser = (req as any).currentUser;
    const userId = currentUser?.userId;
    const { gateway, amount, donorName, donorEmail, donorPhone, type, campaignId } = req.body;

    // If a payment gateway is specified, delegate to the payments service
    if (gateway === "rajhi") {
      // iPayPipe: builds browser redirect URL → donor is redirected to Al Rajhi gateway
      const result = await initiateRajhi({
        amount: Number(amount),
        donorName: donorName || "فاعل خير",
        donorEmail: donorEmail || "",
        donorPhone: donorPhone || "",
        donationType: type || "general",
        userId,
        campaignId,
      });

      res.json({
        success: true,
        gateway: "al-rajhi",
        donationId: result.donationId,
        redirectUrl: result.redirectUrl,
        message: "جاري تحويلك إلى بوابة دفع مصرف الراجحي الآمنة...",
      });
      return;
    }

    if (req.body.paymentMethod === "bank_transfer" || gateway === "bank_transfer") {
      const result = await initiateBankTransfer({
        amount: Number(amount),
        donorName: donorName || "فاعل خير",
        donorEmail: donorEmail || "",
        donorPhone: donorPhone || "",
        donationType: type || "general",
        bankTransferPhoto: req.body.bankTransferPhoto,
        userId,
        campaignId,
      });
      res.status(201).json({ success: true, ...result });
      return;
    }

    // Default: just create donation record (no payment gateway)
    const donation = await donationsService.createDonation({
      ...req.body,
      userId,
    });

    res.status(201).json({ success: true, donation });
  } catch (err: any) {
    const msg: string = err?.message || "";
    if (msg.startsWith("GATEWAY_ERROR:")) {
      const detail = msg.replace("GATEWAY_ERROR:", "").trim();
      res.status(402).json({ success: false, code: "GATEWAY_ERROR", message: `خطأ من بوابة الدفع: ${detail}`, detail });
      return;
    }
    handleError(err, res);
  }
}

export async function getDonations(req: Request, res: Response): Promise<void> {
  try {
    const currentUser = (req as any).currentUser;
    const { campaignId, status, page, limit } = req.query;

    let userId: string | undefined;
    if (req.query.userId) {
      userId = req.query.userId as string;
    } else if (currentUser && !["admin", "manager", "accountant"].includes(currentUser.role)) {
      userId = currentUser.userId;
    }

    const result = await donationsService.getDonations({
      userId,
      campaignId: campaignId as string,
      status: status as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getDonationById(req: Request, res: Response): Promise<void> {
  try {
    const donation = await donationsService.getDonationById(req.params.id as string);
    if (!donation) {
      res.status(404).json({ message: "التبرع غير موجود", success: false });
      return;
    }
    res.json({ success: true, donation });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getDonationsByCampaign(req: Request, res: Response): Promise<void> {
  try {
    const donations = await donationsService.getDonationsByCampaign(req.params.campaignId as string);
    res.json({ success: true, donations });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getTopDonors(req: Request, res: Response): Promise<void> {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const donors = await donationsService.getTopDonors(limit);
    res.json({ success: true, donors });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getDonationStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await donationsService.getDonationStats();
    res.json({ success: true, stats });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getHajjStats(req: Request, res: Response): Promise<void> {
  try {
    const HAJJ_COST = 12000;
    const [confirmedDocs, pendingDocs] = await Promise.all([
      db.collection("donations").find({ type: "hajj", status: "confirmed" }, { projection: { amount: 1 } }).toArray(),
      db.collection("donations").find({ type: "hajj", status: "pending" },   { projection: { amount: 1 } }).toArray(),
    ]);

    const confirmedAmount = confirmedDocs.reduce((s: number, d: any) => s + (Number(d.amount) || 0), 0);
    const pendingAmount   = pendingDocs.reduce((s: number, d: any) => s + (Number(d.amount) || 0), 0);
    const totalAmount = confirmedAmount + pendingAmount;

    const completedPilgrims = Math.floor(confirmedAmount / HAJJ_COST);
    const currentProgress = totalAmount % HAJJ_COST;
    const currentProgressPercent = Math.round((currentProgress / HAJJ_COST) * 100);
    const confirmedPilgrims = Math.floor(confirmedAmount / HAJJ_COST);
    const totalPilgrims = Math.floor(totalAmount / HAJJ_COST);

    res.json({
      success: true,
      totalAmount,
      confirmedAmount,
      pendingAmount,
      completedPilgrims: confirmedPilgrims,
      totalPilgrims,
      currentProgress,
      currentProgressPercent,
      hajjCost: HAJJ_COST,
    });
  } catch (err) {
    handleError(err, res);
  }
}

export async function softDeleteDonation(req: Request, res: Response): Promise<void> {
  try {
    await donationsService.softDeleteDonation(req.params.id as string);
    res.json({ success: true, message: "تم حذف التبرع" });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getDonationStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const donation = await donationsService.getDonationById(id);
    if (!donation) {
      res.status(404).json({ success: false });
      return;
    }
    const d = donation as any;
    res.json({
      success: true,
      donationId: id,
      status: d.status,
      paymentStatus: d.paymentStatus,
      amount: d.amount,
      donorName: d.donorName,
      donorEmail: d.donorEmail,
      type: d.type,
      certificateId: d.certificateId,
      receiptId: d.receiptId,
      createdAt: d.createdAt,
    });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getDeletedDonations(req: Request, res: Response): Promise<void> {
  try {
    const donations = await donationsService.getDeletedDonations();
    res.json({ success: true, donations });
  } catch (err) {
    handleError(err, res);
  }
}

export async function rajhiDebug(req: Request, res: Response): Promise<void> {
  try {
    const siteSettings = await db.collection("settings").findOne({});
    const s = siteSettings as any;
    const tranportalId       = s?.rajhiTranportalId       || process.env.RAJHI_TRANPORTAL_ID || "";
    const tranportalPassword = s?.rajhiTranportalPassword || process.env.RAJHI_TRANPORTAL_PASSWORD || "";
    const resourceKey        = s?.rajhiResourceKey        || process.env.RAJHI_RESOURCE_KEY || "";
    const baseUrl = process.env.BASE_URL || "https://tuwaiqassociation.sa";
    const callbackUrl = `${baseUrl}/api/donations/rajhi-callback`;
    const GATEWAY_API_URL = "https://digitalpayments.alrajhibank.com.sa/pg/payment/hosted.htm";
    const testOrderId = "DEBUG-TEST-001";

    // Build the JSON plaintext (new confirmed format)
    const plaintext = JSON.stringify([{
      id: tranportalId,
      password: tranportalPassword,
      action: "1",
      currencyCode: "682",
      errorURL: callbackUrl,
      responseURL: callbackUrl,
      trackId: testOrderId,
      amt: "1.00",
    }]);

    // Encrypt with AES-256 (confirmed by Neoleap support)
    const trandata = aesEncryptVariant(plaintext, resourceKey, "aes-256-cbc");
    const requestBody = JSON.stringify([{
      id: tranportalId,
      trandata,
      errorURL: callbackUrl,
      responseURL: callbackUrl,
    }]);

    // Make the real API call to the gateway
    let gatewayStatus = 0;
    let gatewayBody = "";
    let apiError = "";
    try {
      const gatewayRes = await fetch(GATEWAY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: requestBody,
      });
      gatewayStatus = gatewayRes.status;
      gatewayBody = await gatewayRes.text();
    } catch (e: any) {
      apiError = e.message;
    }

    // Parse result
    let paymentId = "";
    let paymentUrl = "";
    let parseError = "";
    try {
      const parsed = JSON.parse(gatewayBody);
      const first = parsed[0];
      if (first?.status === "1" && first?.result) {
        const raw: string = first.result;
        // Format: "<NUMERIC_PAYMENT_ID>:<BaseURL>" e.g. "700202608940724314:https://...paymentpage.htm"
        const firstColon = raw.indexOf(":");
        if (raw.startsWith("http")) {
          paymentUrl = raw;
          try { paymentId = new URL(raw).searchParams.get("PaymentID") || "unknown"; } catch { paymentId = "unknown"; }
        } else if (firstColon >= 0) {
          paymentId = raw.substring(0, firstColon).trim();
          const baseUrl = raw.substring(firstColon + 1).trim();
          paymentUrl = `${baseUrl}?PaymentID=${paymentId}`;
        } else {
          paymentId = raw.trim();
          paymentUrl = `https://digitalpayments.alrajhibank.com.sa/pg/paymentpage.htm?PaymentID=${paymentId}`;
        }
      } else {
        parseError = JSON.stringify(first);
      }
    } catch {
      parseError = "استجابة غير JSON";
    }

    const statusColor = paymentId ? "#d4edda" : "#f8d7da";
    const statusText  = paymentId
      ? `✅ نجح! PaymentID: <b>${paymentId}</b> — <a href="${paymentUrl}" target="_blank">افتح صفحة الدفع</a>`
      : `❌ فشل — HTTP ${gatewayStatus} | ${parseError || apiError || gatewayBody.slice(0, 200)}`;

    // ── Manual decrypt tool ────────────────────────────────────────────────────
    const AES_IV_DBG = "PGKEYENCDECIVSPC";
    let decryptHtml = "";
    const decryptInput = typeof req.query.decrypt === "string" ? req.query.decrypt.trim() : "";
    if (decryptInput) {
      const decAttempts: Array<{ label: string; fn: () => string }> = [
        { label: "AES-256/HEX", fn: () => {
          const k = Buffer.from(resourceKey, "utf8").subarray(0, 32);
          const d = crypto.createDecipheriv("aes-256-cbc", k, Buffer.from(AES_IV_DBG, "utf8"));
          return Buffer.concat([d.update(Buffer.from(decryptInput, "hex")), d.final()]).toString("utf8");
        }},
        { label: "AES-256/BASE64", fn: () => {
          const k = Buffer.from(resourceKey, "utf8").subarray(0, 32);
          const d = crypto.createDecipheriv("aes-256-cbc", k, Buffer.from(AES_IV_DBG, "utf8"));
          return Buffer.concat([d.update(Buffer.from(decryptInput, "base64")), d.final()]).toString("utf8");
        }},
        { label: "AES-192/HEX", fn: () => {
          const k = Buffer.from(resourceKey, "utf8").subarray(0, 24);
          const d = crypto.createDecipheriv("aes-192-cbc", k, Buffer.from(AES_IV_DBG, "utf8"));
          return Buffer.concat([d.update(Buffer.from(decryptInput, "hex")), d.final()]).toString("utf8");
        }},
      ];
      const decResults: string[] = [];
      for (const a of decAttempts) {
        try {
          const plaintext = a.fn();
          decResults.push(`<div style="background:#d4edda;padding:10px;border-radius:6px;margin:6px 0"><b>✅ ${a.label} — نجح!</b><pre style="margin:6px 0;font-size:12px;overflow:auto;white-space:pre-wrap">${plaintext.replace(/</g,"&lt;")}</pre></div>`);
          break;
        } catch (e: any) {
          decResults.push(`<div style="background:#f8d7da;padding:6px 10px;border-radius:6px;margin:4px 0;font-size:12px">❌ ${a.label}: ${e.message}</div>`);
        }
      }
      decryptHtml = decResults.join("");
    }

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><title>Rajhi Debug</title></head>
<body style="font-family:sans-serif;max-width:900px;margin:auto;padding:24px">
  <h1>تشخيص بوابة الراجحي — JSON API</h1>
  <p><b>TranPortal ID:</b> <code>${tranportalId || "⚠️ غير محدد"}</code></p>
  <p><b>Resource Key:</b> <code>${resourceKey ? resourceKey.slice(0, 8) + "..." + resourceKey.slice(-4) : "⚠️ غير محدد"}</code> (${resourceKey.length} حرف)</p>
  <p><b>Callback URL:</b> <code>${callbackUrl}</code></p>
  <hr>
  <h2>الطلب المُرسَل (JSON POST → gateway)</h2>
  <pre style="background:#f4f4f4;padding:12px;border-radius:6px;overflow:auto;font-size:12px">${JSON.stringify(JSON.parse(requestBody), null, 2).replace(/("trandata":\s*")([^"]{40})([^"]+)(")/g, '$1$2...$4')}</pre>
  <p><b>النص الأصلي قبل التشفير:</b></p>
  <pre style="background:#f4f4f4;padding:12px;border-radius:6px;font-size:12px">${plaintext}</pre>
  <h2>استجابة البوابة</h2>
  <div style="background:${statusColor};padding:14px;border-radius:6px;margin:12px 0">${statusText}</div>
  <p><b>HTTP Status:</b> ${gatewayStatus} &nbsp;|&nbsp; <b>Body كامل:</b></p>
  <pre style="background:#f4f4f4;padding:12px;border-radius:6px;font-size:12px;overflow:auto">${gatewayBody || apiError || "(فارغ)"}</pre>
  <hr>
  <h2>🔓 أداة فك التشفير اليدوي</h2>
  <p style="font-size:13px">الصق قيمة <code>trandata</code> من سجلات الـ callback لاختبار فك التشفير:</p>
  <form method="GET" action="/api/donations/rajhi-debug" style="margin-bottom:16px">
    <textarea name="decrypt" placeholder="الصق قيمة trandata هنا..." style="width:100%;height:80px;font-family:monospace;font-size:11px;padding:8px;border:1px solid #ccc;border-radius:6px">${req.query.decrypt || ""}</textarea>
    <button type="submit" style="margin-top:8px;padding:8px 20px;background:#0d6efd;color:white;border:none;border-radius:6px;cursor:pointer">جرّب فك التشفير</button>
  </form>
  ${decryptHtml}
  <hr>
  <p style="color:gray;font-size:11px">هذه الصفحة للإدارة فقط — تُجري اتصالاً حقيقياً بالبوابة.</p>
</body></html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    handleError(err, res);
  }
}

export async function serveRajhiPaymentPage(req: Request, res: Response): Promise<void> {
  // No longer used — payment flow now redirects directly to paymentpage.htm?PaymentID=XXX
  res.status(410).send("<h2>هذا المسار لم يعد مستخدماً. يرجى المحاولة من جديد.</h2>");
}

export async function handleRajhiCallback(req: Request, res: Response): Promise<void> {
  const callbackAt = new Date();
  try {
    // Al Rajhi may POST as:
    //  a) application/x-www-form-urlencoded  → req.body is a plain object
    //  b) application/json with a JSON ARRAY → req.body is an array like [{...}]
    // Normalise to a flat object in all cases.
    let rawBody = req.body;
    if (Array.isArray(rawBody) && rawBody.length > 0) {
      rawBody = rawBody[0];
    }
    // Merge body + query params — Al Rajhi may use GET or POST
    const body = { ...rawBody, ...req.query } as Record<string, string>;

    // Log EVERYTHING — critical for diagnosing payment issues in production
    console.log("[Rajhi Callback] ══════════════════════════════════════════");
    console.log("[Rajhi Callback] Method:", req.method);
    console.log("[Rajhi Callback] Content-Type:", req.headers["content-type"]);
    console.log("[Rajhi Callback] Raw body keys:", Object.keys(body));
    console.log("[Rajhi Callback] Raw body:", JSON.stringify(body));

    // ── Persist raw callback to MongoDB for production debugging ──────────────
    // Even if the payment fails to parse, we can inspect this record later
    try {
      const trandataFull = body.trandata || body.TranData || body.TRANDATA || "";
      await db.collection("payment_callbacks").insertOne({
        receivedAt: callbackAt,
        method: req.method,
        contentType: req.headers["content-type"] || "",
        bodyKeys: Object.keys(body),
        // Save all body fields except trandata for quick overview
        bodyWithoutTrandata: Object.fromEntries(
          Object.entries(body).filter(([k]) => k.toLowerCase() !== "trandata")
        ),
        // Save full trandata separately for decryption attempts
        trandata: trandataFull,
        trandataLength: trandataFull.length,
        // Also show first 300 chars for quick inspection
        trandataPreview: trandataFull.slice(0, 300),
      });
    } catch (logErr) {
      console.error("[Rajhi Callback] Could not save callback log:", (logErr as Error).message);
    }

    const siteSettings = await db.collection("settings").findOne({});
    const resourceKey = (siteSettings as any)?.rajhiResourceKey || process.env.RAJHI_RESOURCE_KEY;

    if (!resourceKey) {
      console.error("[Rajhi Callback] No resource key configured!");
      res.redirect("/payment-result?status=pending");
      return;
    }

    const result = verifyRajhiCallback(body, resourceKey);
    console.log("[Rajhi Callback] Verification result:", JSON.stringify({
      valid: result.valid,
      successful: result.successful,
      responseCode: result.responseCode,
      orderId: result.orderId,
      paymentId: result.paymentId,
    }));

    // Resolve the order ID from multiple possible sources
    let orderId = result.orderId
      || body.OrderID || body.orderId
      || body.trackId || body.trackid || body.TrackID
      || body.ref     || body.Ref;

    // ── Fallback: match via Al Rajhi's paymentid ↔ our rajhiRef field ──────────
    // Al Rajhi sends `paymentid` in the callback body. We store their PaymentID
    // as `rajhiRef` when initiating the payment. Use this to identify the donation
    // when orderId cannot be resolved from decrypted trandata.
    const rajhiPaymentId = body.paymentid || body.PaymentId || body.PaymentID;
    if (!orderId && rajhiPaymentId) {
      const donationByRef = await db.collection("donations").findOne({ rajhiRef: rajhiPaymentId });
      if (donationByRef) {
        orderId = donationByRef._id.toString();
        console.log("[Rajhi Callback] ✅ Resolved orderId via rajhiRef:", rajhiPaymentId, "→", orderId);
      }
    }

    if (!orderId) {
      // Can't identify which donation — log and return a safe response
      console.error("[Rajhi Callback] ⚠️  Cannot identify orderId from callback. Full body:", JSON.stringify(body));
      res.redirect("/payment-result?status=pending");
      return;
    }

    console.log("[Rajhi Callback] Resolved orderId:", orderId);

    // ── Helper: always inquiry before marking failed ───────────────────────────
    const runInquiry = async (): Promise<{ queried: boolean; successful: boolean; result: string }> => {
      try {
        const s2 = (await db.collection("settings").findOne({})) as any;
        const tId  = s2?.rajhiTranportalId       || process.env.RAJHI_TRANPORTAL_ID || "";
        const tPwd = s2?.rajhiTranportalPassword || process.env.RAJHI_TRANPORTAL_PASSWORD || "";
        const rKey = s2?.rajhiResourceKey        || process.env.RAJHI_RESOURCE_KEY || "";
        const cbUrl = `${process.env.BASE_URL || "https://tuwaiqassociation.sa"}/api/donations/rajhi-callback`;
        if (!tId || !tPwd || !rKey) return { queried: false, successful: false, result: "" };
        const donationForInq = await donationsService.getDonationById(orderId);
        const rajhiRef = (donationForInq as any)?.rajhiRef;
        return await inquireRajhiPayment({
          tranportalId: tId, tranportalPassword: tPwd, resourceKey: rKey,
          orderId,
          paymentId: rajhiRef && rajhiRef !== orderId ? rajhiRef : undefined,
          errorUrl: cbUrl, responseUrl: cbUrl,
        });
      } catch (e) {
        console.error("[Rajhi Callback] Inquiry error:", (e as Error).message);
        return { queried: false, successful: false, result: "" };
      }
    };

    if (result.successful) {
      // ✅ Callback confirmed: payment captured
      await donationsService.updateDonationStatus({ _id: orderId }, "confirmed");
      console.log("[Rajhi Callback] ✅ Donation", orderId, "marked CONFIRMED (callback)");
      res.redirect(`/payment-result?status=success&id=${orderId}`);
      return;
    }

    // ⚠️  Callback unclear or decryption failed — run inquiry to double-check
    console.log("[Rajhi Callback] Callback unclear (responseCode:", result.responseCode, ") — running inquiry for", orderId);
    const inquiry = await runInquiry();
    console.log("[Rajhi Callback] Inquiry result:", inquiry.queried, inquiry.successful, inquiry.result);

    if (inquiry.successful) {
      await donationsService.updateDonationStatus({ _id: orderId }, "confirmed");
      console.log("[Rajhi Callback] ✅ Donation", orderId, "CONFIRMED via inquiry");
      res.redirect(`/payment-result?status=success&id=${orderId}`);
      return;
    }

    // ─── SAFETY RULE ───────────────────────────────────────────────────────────
    // NEVER mark a donation as "failed" from a callback or inquiry alone.
    // Al Rajhi callbacks can arrive with wrong decryption / wrong timing.
    // The inquiry may return "not captured" even when money WAS deducted
    // (e.g. inquiry runs too soon after capture, or trackId lookup fails).
    //
    // Policy: if we cannot CONFIRM the payment, leave it as PENDING.
    // Admin uses the "استرداد المدفوعات المعلقة" tool to bulk-recover.
    // Manual fix: admin can set any donation to confirmed via the admin panel.
    // ──────────────────────────────────────────────────────────────────────────
    console.error("[Rajhi Callback] ⚠️  Could not confirm payment for order", orderId,
      "— inquiry:", inquiry.queried, inquiry.result,
      "— leaving as PENDING for manual review (NEVER marking failed)");
    res.redirect(`/payment-result?status=pending&id=${orderId}`);

  } catch (err) {
    console.error("[Rajhi Callback] Unexpected error:", err);
    res.redirect("/payment-result?status=pending");
  }
}

/**
 * Public: Query Al Rajhi directly for the payment status of a donation.
 * Called by the client polling when callback hasn't been received.
 * Accessible without auth because we only need the donationId (opaque).
 */
export async function rajhiInquiry(req: Request, res: Response): Promise<void> {
  try {
    const donation = await donationsService.getDonationById(req.params.id as string);
    if (!donation) {
      res.status(404).json({ success: false, message: "التبرع غير موجود" });
      return;
    }

    const d = donation as any;

    // Already confirmed — return immediately, no need to re-query
    if (d.status === "confirmed" || d.status === "success") {
      res.json({ success: true, inquired: true, status: d.status, paymentStatus: d.paymentStatus, resolved: true });
      return;
    }

    // Not a Rajhi payment — return as-is
    if (d.paymentMethod !== "rajhi") {
      res.json({ success: true, inquired: false, status: d.status, paymentStatus: d.paymentStatus, message: "هذا التبرع ليس عبر الراجحي" });
      return;
    }

    // CRITICAL: Even for "failed" donations, re-query the gateway.
    // The donation may have been wrongly marked failed (e.g. callback decryption error,
    // expiry cron, or gateway sent a false failure while money was actually captured).
    // Only skip re-query if the donation was confirmed > 24 hours ago (old enough to trust).
    if (d.status === "failed" && d.paymentStatus === "failed" && d.rajhiRef) {
      const ageHours = (Date.now() - new Date(d.updatedAt || d.createdAt).getTime()) / 3600000;
      if (ageHours > 24) {
        // Too old to recover via inquiry — return as failed
        res.json({ success: true, inquired: false, status: "failed", paymentStatus: "failed", resolved: true });
        return;
      }
      // Within 24 hours — still try the gateway (fall through to inquiry below)
      console.log("[Rajhi Inquiry] Re-querying failed donation", d._id, "— may recover if gateway says captured");
    }

    const rajhiRef = d.rajhiRef;

    const siteSettings = await db.collection("settings").findOne({});
    const s = siteSettings as any;
    const tranportalId       = s?.rajhiTranportalId       || process.env.RAJHI_TRANPORTAL_ID || "";
    const tranportalPassword = s?.rajhiTranportalPassword || process.env.RAJHI_TRANPORTAL_PASSWORD || "";
    const resourceKey        = s?.rajhiResourceKey        || process.env.RAJHI_RESOURCE_KEY || "";

    if (!tranportalId || !tranportalPassword || !resourceKey) {
      res.json({ success: false, message: "إعدادات بوابة الراجحي غير مكتملة" });
      return;
    }

    const baseUrl = process.env.BASE_URL || "https://tuwaiqassociation.sa";
    const callbackUrl = `${baseUrl}/api/donations/rajhi-callback`;

    // orderId = donation's MongoDB _id = trackId sent during initiation
    // rajhiRef may be the actual Al Rajhi PaymentID OR the orderId (if stored incorrectly)
    const donationObjId = d._id.toString();
    const inquiry = await inquireRajhiPayment({
      tranportalId,
      tranportalPassword,
      resourceKey,
      orderId: donationObjId,
      paymentId: rajhiRef && rajhiRef !== donationObjId ? rajhiRef : undefined,
      errorUrl: callbackUrl,
      responseUrl: callbackUrl,
    });

    // [PCI DSS 10.3] Log only non-sensitive metadata
    console.log("[Rajhi Inquiry] Donation", d._id, "queried:", inquiry.queried, "successful:", inquiry.successful, "code:", inquiry.result?.slice(0, 20));

    if (inquiry.queried && inquiry.successful) {
      await donationsService.updateDonationStatus({ _id: d._id.toString() }, "confirmed");
      console.log("[Rajhi Inquiry] ✅ Donation", d._id, "confirmed via inquiry");
      res.json({ success: true, inquired: true, status: "confirmed", paymentStatus: "confirmed", resolved: true });
      return;
    }

    // SAFETY: never auto-mark as failed from inquiry response alone.
    // The inquiry may fail to decrypt or return wrong data. Admin manually confirms/rejects.

    // Still unclear — keep pending
    res.json({
      success: true,
      inquired: inquiry.queried,
      status: d.status,
      paymentStatus: d.paymentStatus,
      resolved: false,
      gatewayResult: inquiry.result || inquiry.error || "unknown",
    });
  } catch (err) {
    console.error("[rajhiInquiry] Error:", err);
    handleError(err, res);
  }
}

/**
 * Admin: Batch recover all pending Al Rajhi donations by querying the gateway.
 * Processes donations that have a rajhiRef (PaymentID) but are still pending.
 */
export async function rajhiRecoverPending(req: Request, res: Response): Promise<void> {
  try {
    const siteSettings = await db.collection("settings").findOne({});
    const s = siteSettings as any;
    const tranportalId       = s?.rajhiTranportalId       || process.env.RAJHI_TRANPORTAL_ID || "";
    const tranportalPassword = s?.rajhiTranportalPassword || process.env.RAJHI_TRANPORTAL_PASSWORD || "";
    const resourceKey        = s?.rajhiResourceKey        || process.env.RAJHI_RESOURCE_KEY || "";

    if (!tranportalId || !tranportalPassword || !resourceKey) {
      res.status(400).json({ success: false, message: "إعدادات بوابة الراجحي غير مكتملة" });
      return;
    }

    // Find all pending OR recently-failed Rajhi donations (within 48 hours).
    // The donation _id IS the trackId sent to the gateway so we can query even without rajhiRef.
    // We include "failed" donations because the expiry cron or a bad callback may have wrongly
    // marked a payment as failed when Al Rajhi actually captured the money.
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const pendingDonations = await DonationModel.find({
      paymentMethod: "rajhi",
      status: { $in: ["pending", "failed"] },
      createdAt: { $gte: cutoff },
      isDeleted: { $ne: true },
    }).limit(100).lean();

    console.log(`[Rajhi Recovery] Processing ${pendingDonations.length} pending donations...`);

    const baseUrl = process.env.BASE_URL || "https://tuwaiqassociation.sa";
    const callbackUrl = `${baseUrl}/api/donations/rajhi-callback`;
    const results = { confirmed: 0, failed: 0, unclear: 0, errors: 0 };

    for (const donation of pendingDonations) {
      const d = donation as any;
      try {
        const donationObjId = d._id.toString();
        // orderId = MongoDB donation _id = trackId sent to gateway during initiation
        // rajhiRef may be the Al Rajhi PaymentID or the orderId (if stored incorrectly)
        const inquiry = await inquireRajhiPayment({
          tranportalId,
          tranportalPassword,
          resourceKey,
          orderId: donationObjId,
          paymentId: d.rajhiRef && d.rajhiRef !== donationObjId ? d.rajhiRef : undefined,
          errorUrl: callbackUrl,
          responseUrl: callbackUrl,
        });

        if (inquiry.queried && inquiry.successful) {
          await donationsService.updateDonationStatus({ _id: d._id.toString() }, "confirmed");
          results.confirmed++;
          console.log("[Rajhi Recovery] ✅ Confirmed:", d._id, "PaymentID:", d.rajhiRef);
        } else {
          // SAFETY: never auto-mark as failed in recovery.
          // The inquiry may fail for many reasons (timing, API error, wrong key).
          // Admin must manually confirm or reject. Keep as pending/unclear.
          results.unclear++;
          console.log("[Rajhi Recovery] ⚠️  Not confirmed:", d._id, "queried:", inquiry.queried, "result:", inquiry.result, inquiry.error);
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        results.errors++;
        console.error("[Rajhi Recovery] Error for", d._id, ":", (err as Error).message);
      }
    }

    console.log("[Rajhi Recovery] Done:", JSON.stringify(results));
    res.json({
      success: true,
      processed: pendingDonations.length,
      ...results,
      message: `تمت المعالجة: تأكيد ${results.confirmed}، فشل ${results.failed}، غير محدد ${results.unclear}`,
    });
  } catch (err) {
    console.error("[rajhiRecoverPending] Error:", err);
    handleError(err, res);
  }
}

/**
 * Admin: view all raw payment gateway callbacks stored in MongoDB.
 * Useful for diagnosing payment issues in production by seeing exactly
 * what the gateway sends to our callback URL.
 */
export async function getPaymentCallbacks(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(parseInt(String(req.query.limit || "50")), 200);
    const callbacks = await db
      .collection("payment_callbacks")
      .find({})
      .sort({ receivedAt: -1 })
      .limit(limit)
      .toArray();

    res.json({ ok: true, count: callbacks.length, callbacks });
  } catch (err) {
    console.error("[getPaymentCallbacks] Error:", err);
    res.status(500).json({ ok: false, message: "فشل تحميل سجلات الـ callbacks" });
  }
}
