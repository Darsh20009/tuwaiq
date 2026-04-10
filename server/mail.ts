import nodemailer from "nodemailer";

// =============================================
// CONFIGURATION
// =============================================
const ORG_NAME = "جمعية طويق للخدمات الإنسانية";
const ORG_LICENSE = "1000820300";
const APP_URL = process.env.APP_URL || "https://tuwaiqassociation.sa";
const FROM_EMAIL = process.env.SMTP_FROM || "noreply@tuwaiqassociation.sa";
const FROM_FORMATTED = `"${ORG_NAME}" <${FROM_EMAIL}>`;

// Public logo URL — works in all email clients including Gmail and Outlook web
const LOGO_URL = `${APP_URL}/images/logo-main.png`;
// Email banner image — first frame extracted from the charity video
const BANNER_URL = `${APP_URL}/images/email-banner.jpg`;

// =============================================
// EMAIL QUEUE & LOGS (stored in MongoDB)
// =============================================
let _db: any = null;

export function setMailDb(db: any) {
  _db = db;
}

async function logEmail(entry: {
  to: string;
  subject: string;
  status: "sent" | "failed" | "queued";
  messageId?: string;
  error?: string;
  provider?: string;
}) {
  if (!_db) return;
  try {
    await _db.collection("email_logs").insertOne({
      ...entry,
      createdAt: new Date(),
    });
  } catch (_) {}
}

// =============================================
// RETRY HELPER
// =============================================
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1500
): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

// =============================================
// SMTP2GO HTTP API (Primary — works on Render)
// =============================================
export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

async function sendViaSMTP2GO(options: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
}): Promise<{ messageId: string }> {
  const apiKey = process.env.SMTP2GO_API_KEY;
  if (!apiKey) throw new Error("SMTP2GO_API_KEY not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const attachmentsPayload = (options.attachments || []).map((a) => ({
    filename: a.filename,
    fileblob: a.content.toString("base64"),
    mimetype: a.contentType,
  }));

  try {
    const response = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        api_key: apiKey,
        sender: FROM_FORMATTED,
        to: [options.to],
        subject: options.subject,
        html_body: options.html,
        text_body: options.text || stripHtml(options.html || ""),
        ...(attachmentsPayload.length ? { attachments: attachmentsPayload } : {}),
      }),
    });

    const data = (await response.json()) as any;

    if (!response.ok || data?.data?.succeeded !== 1) {
      const failures = data?.data?.failures;
      throw new Error(
        `SMTP2GO error: ${failures ? JSON.stringify(failures) : JSON.stringify(data)}`
      );
    }
    return { messageId: data?.data?.email_id || "smtp2go-ok" };
  } finally {
    clearTimeout(timeout);
  }
}

// =============================================
// SMTP NODEMAILER (Fallback)
// =============================================
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    // Use port 2525 by default — works on Render/Heroku (ports 25/465/587 often blocked)
    const port = parseInt(process.env.SMTP_PORT || "2525");
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.smtp2go.com",
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
    });
  }
  return _transporter;
}

async function sendViaSmtp(options: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
}): Promise<{ messageId: string }> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP credentials not configured");
  }
  const info = await getTransporter().sendMail({
    from: FROM_FORMATTED,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || stripHtml(options.html || ""),
    headers: {
      "X-Mailer": "Tuwaiq Mail System",
      "List-Unsubscribe": `<mailto:unsubscribe@tuwaiqassociation.sa?subject=unsubscribe>`,
    },
    attachments: (options.attachments || []).map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  });
  return { messageId: info.messageId };
}

// =============================================
// MAIN sendEmail — Tries SMTP2GO first, then SMTP
// =============================================
export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!to || !to.includes("@")) {
    return { success: false, error: "Invalid email address" };
  }

  const finalHtml = html ? wrapEmail(html) : undefined;
  const finalText = text || stripHtml(finalHtml || "");

  // Try SMTP2GO HTTP API with retry
  if (process.env.SMTP2GO_API_KEY) {
    try {
      const result = await withRetry(() =>
        sendViaSMTP2GO({ to, subject, html: finalHtml, text: finalText, attachments }),
        2, 1000
      );
      console.log(`[Mail] ✓ Sent via SMTP2GO to ${to}: ${result.messageId}`);
      await logEmail({ to, subject, status: "sent", messageId: result.messageId, provider: "smtp2go" });
      return { success: true, messageId: result.messageId };
    } catch (err: any) {
      console.error(`[Mail] SMTP2GO failed after retries: ${err.message}`);
    }
  }

  // Fallback: SMTP
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const result = await withRetry(() =>
        sendViaSmtp({ to, subject, html: finalHtml, text: finalText, attachments })
      );
      console.log(`[Mail] ✓ Sent via SMTP to ${to}: ${result.messageId}`);
      await logEmail({ to, subject, status: "sent", messageId: result.messageId, provider: "smtp" });
      return { success: true, messageId: result.messageId };
    } catch (err: any) {
      console.error(`[Mail] SMTP fallback failed: ${err.message}`);
      await logEmail({ to, subject, status: "failed", error: err.message });
      return { success: false, error: err.message };
    }
  }

  const errMsg = "No email transport configured. Set SMTP2GO_API_KEY or SMTP_USER/SMTP_PASS.";
  console.error(`[Mail] ${errMsg}`);
  await logEmail({ to, subject, status: "failed", error: errMsg });
  return { success: false, error: errMsg };
}

// =============================================
// HTML WRAPPER — Table-based for email clients
// =============================================
function wrapEmail(content: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${ORG_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;direction:rtl;">
<!--[if mso]><center><table width="640"><tr><td><![endif]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;">

        <!-- VIDEO BANNER — top of every email -->
        <tr>
          <td style="border-radius:12px 12px 0 0;overflow:hidden;padding:0;margin:0;">
            <a href="${APP_URL}" target="_blank" style="display:block;text-decoration:none;">
              <img
                src="${BANNER_URL}"
                alt="جمعية طويق للخدمات الإنسانية"
                width="640"
                style="display:block;width:100%;max-width:640px;height:auto;border-radius:12px 12px 0 0;"
              />
            </a>
          </td>
        </tr>

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#059669 0%,#047857 100%);padding:22px 36px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-left:12px;vertical-align:middle;">
                        <img
                          src="${LOGO_URL}"
                          alt="${ORG_NAME}"
                          width="52"
                          height="52"
                          style="display:block;border-radius:10px;background:#ffffff;padding:5px;box-shadow:0 2px 8px rgba(0,0,0,0.20);"
                        />
                      </td>
                      <td style="vertical-align:middle;padding-right:10px;">
                        <div style="color:#fff;font-size:17px;font-weight:900;letter-spacing:0.4px;text-align:right;">${ORG_NAME}</div>
                        <div style="color:rgba(255,255,255,0.70);font-size:10px;margin-top:2px;text-align:right;">ترخيص رقم ${ORG_LICENSE}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px;border-right:1px solid #e2e8f0;border-left:1px solid #e2e8f0;color:#1e293b;font-size:15px;line-height:1.8;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center;">
            <p style="margin:0 0 6px;color:#64748b;font-size:11px;">
              ${ORG_NAME} | رقم الترخيص: ${ORG_LICENSE}
            </p>
            <p style="margin:0;color:#94a3b8;font-size:10px;">
              هذه رسالة آلية من النظام، يرجى عدم الرد عليها مباشرة.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
<!--[if mso]></td></tr></table></center><![endif]-->
</body>
</html>`;
}

// =============================================
// UTILITY — Strip HTML for plain text fallback
// =============================================
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// =============================================
// EMAIL TEMPLATES
// =============================================

function actionButton(text: string, url: string, color = "#059669"): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:24px 0 16px;">
        <a href="${url}" target="_blank"
           style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;
                  padding:14px 40px;border-radius:8px;font-weight:bold;font-size:15px;
                  letter-spacing:0.5px;mso-padding-alt:0;text-align:center;">
          <!--[if mso]><i style="letter-spacing:40px;mso-font-width:-100%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
          ${text}
          <!--[if mso]><i style="letter-spacing:40px;mso-font-width:-100%">&nbsp;</i><![endif]-->
        </a>
      </td>
    </tr>
  </table>`;
}

function infoBox(rows: { label: string; value: string }[], highlight?: string): string {
  const rowsHtml = rows.map(r => `
    <tr>
      <td style="padding:8px 12px;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;white-space:nowrap;">${r.label}</td>
      <td style="padding:8px 12px;font-weight:bold;color:${highlight || "#1e293b"};border-bottom:1px solid #e2e8f0;">${r.value}</td>
    </tr>`).join("");
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin:20px 0;overflow:hidden;">
    ${rowsHtml}
  </table>`;
}

function alertBox(text: string, type: "info" | "warning" | "success" = "info"): string {
  const colors = {
    info: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
    warning: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
    success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
  };
  const c = colors[type];
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${c.bg};border:1px solid ${c.border};border-radius:8px;margin:16px 0;">
    <tr>
      <td style="padding:14px 16px;color:${c.text};font-size:13px;line-height:1.6;">
        ${text}
      </td>
    </tr>
  </table>`;
}

export const emailTemplates = {

  // ── 1. Welcome (new donor registration) ──────────────────────────────
  welcome: (name: string) => ({
    subject: `مرحباً بك في ${ORG_NAME} 🌿`,
    html: `
      <h2 style="color:#059669;margin-top:0;font-size:22px;">أهلاً وسهلاً، ${name}!</h2>
      <p>يسعدنا انضمامك إلى مجتمع <strong>${ORG_NAME}</strong>. يمكنك الآن المساهمة في دعم المحتاجين، متابعة تبرعاتك، والحصول على شهاداتك الضريبية.</p>
      ${alertBox("✓ حسابك مفعّل وجاهز للاستخدام الآن", "success")}
      ${actionButton("ابدأ التبرع الآن", `${APP_URL}/donate`)}
      <p style="color:#64748b;font-size:13px;">شكراً لثقتك بنا. دعمك يُغير حياة الأسر المحتاجة.</p>
    `,
  }),

  // ── 2. Donation Received ─────────────────────────────────────────────
  donationReceived: (donorName: string, amount: string, donationType?: string, refNum?: string) => ({
    subject: `تأكيد تبرعكم الكريم — ${parseFloat(amount).toLocaleString("ar-SA")} ريال سعودي | ${ORG_NAME}`,
    html: `
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-block;background:#f0fdf4;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">🤲</div>
        <h2 style="color:#059669;margin:12px 0 4px;font-size:22px;">تأكيد استلام تبرعكم</h2>
        <p style="color:#64748b;margin:0;font-size:14px;">جزاكم الله خيراً وبارك في عطائكم</p>
      </div>
      <p>فضيلة المتبرع الكريم / <strong>${donorName}</strong>،</p>
      <p>السلام عليكم ورحمة الله وبركاته،</p>
      <p>
        يسعد <strong>${ORG_NAME}</strong> إخطاركم بأنه تم استلام تبرعكم الكريم وتسجيله في منظومتنا بنجاح.
        نسأل الله العلي القدير أن يبارك في أموالكم ويجعل هذا التبرع في ميزان حسناتكم يوم القيامة.
      </p>
      ${infoBox([
        { label: "اسم المتبرع", value: donorName },
        { label: "مبلغ التبرع", value: `${parseFloat(amount).toLocaleString("ar-SA")} ريال سعودي` },
        ...(donationType ? [{ label: "مسمى التبرع", value: donationType }] : []),
        { label: "تاريخ العملية", value: new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
        ...(refNum ? [{ label: "رقم الإيصال", value: refNum }] : []),
        { label: "بوابة الدفع", value: "مصرف الراجحي" },
        { label: "الحالة", value: "✓ مؤكد ومسجّل" },
      ], "#059669")}
      ${alertBox(`
        <strong>«مَثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ»</strong><br>
        <span style="font-size:12px;opacity:0.85;">صدق الله العظيم — سورة البقرة: ٢٦١</span>
      `, "success")}
      <p>يمكنكم الاطلاع على شهادة تبرعكم وفاتورة الإيصال من خلال حسابكم الشخصي على منصتنا.</p>
      ${actionButton("عرض شهادة التبرع والفاتورة", `${APP_URL}/profile`)}
      <p style="color:#64748b;font-size:13px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px;">
        إذا كان لديكم أي استفسار أو احتجتم إلى أي مساعدة، يسعدنا التواصل معكم عبر موقعنا الإلكتروني أو قنوات التواصل المعتمدة.
        <br>وشكراً لكم على ثقتكم وكريم تبرعكم.
      </p>
    `,
  }),

  // ── 3. Bank Transfer Confirmation ────────────────────────────────────
  transferConfirmation: (donorName: string, amount: string, bankName: string, referenceNumber: string) => ({
    subject: `تأكيد استلام التحويل البنكي — ${ORG_NAME}`,
    html: `
      <h2 style="color:#059669;margin-top:0;">تأكيد استلام التحويل البنكي</h2>
      <p>مرحباً <strong>${donorName}</strong>،</p>
      <p>تلقينا تحويلك البنكي وهو قيد المراجعة من قِبل فريقنا المالي. سنُبلغك بالاعتماد خلال 24 ساعة عمل.</p>
      ${infoBox([
        { label: "المبلغ", value: `${parseFloat(amount).toLocaleString("ar-SA")} ريال سعودي` },
        { label: "البنك", value: bankName },
        { label: "رقم المرجع", value: referenceNumber },
        { label: "الحالة", value: "قيد المراجعة" },
        { label: "التاريخ", value: new Date().toLocaleDateString("ar-SA") },
      ])}
      ${alertBox("⏳ تستغرق المراجعة عادةً من 4 إلى 24 ساعة عمل. ستصلك رسالة تأكيد عند الاعتماد.", "info")}
    `,
  }),

  // ── 4. Employee Account Setup ─────────────────────────────────────────
  employeeSetup: (name: string, employeeId: string, setupLink: string, role: string) => {
    const roleLabels: Record<string, string> = {
      delivery: "موظف توصيل",
      programmer: "مبرمج / مطوّر",
      accountant: "محاسب",
      sales: "موظف مبيعات وتسويق",
      employee: "موظف",
      manager: "مدير تنفيذي",
      admin: "مدير النظام",
    };
    const roleLabel = roleLabels[role] || "موظف";
    return {
      subject: `تهانينا! تم قبولك في ${ORG_NAME} — إعداد حسابك`,
      html: `
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:#f0fdf4;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">🎉</div>
          <h2 style="color:#059669;margin:12px 0 4px;font-size:22px;">تهانينا على القبول!</h2>
          <p style="color:#64748b;margin:0;font-size:14px;">انضممت رسمياً إلى فريق جمعية طويق</p>
        </div>
        <p>مرحباً <strong>${name}</strong>،</p>
        <p>يسعدنا إبلاغك بأنه تم <strong>قبول طلبك والموافقة عليه</strong> للانضمام إلى فريق ${ORG_NAME}.</p>
        ${infoBox([
          { label: "المسمى الوظيفي", value: roleLabel },
          { label: "المعرف الوظيفي", value: employeeId },
          { label: "الجمعية", value: ORG_NAME },
        ], "#059669")}
        <p>لبدء عملك، يرجى إعداد كلمة المرور لحسابك الجديد بالضغط على الزر أدناه:</p>
        ${actionButton("إعداد كلمة المرور", setupLink)}
        ${alertBox(`⚠️ هذا الرابط صالح لمدة <strong>48 ساعة</strong> فقط من وقت استلام هذا البريد. إذا انتهت الصلاحية، تواصل مع الإدارة لإعادة الإرسال.`, "warning")}
        <p style="color:#64748b;font-size:13px;">إذا لم تتمكن من فتح الزر، انسخ هذا الرابط في المتصفح:<br>
        <span style="color:#059669;word-break:break-all;font-size:12px;">${setupLink}</span></p>
      `,
    };
  },

  // ── 5. Internal Mail Notification ────────────────────────────────────
  internalMail: (fromName: string, fromEmployeeId: string, subject: string, body: string, appUrl: string) => ({
    subject: `[بريد داخلي] ${subject}`,
    html: `
      <h3 style="color:#059669;margin-top:0;">📬 رسالة داخلية جديدة</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-right:4px solid #059669;border-radius:0 8px 8px 0;margin-bottom:20px;">
        <tr>
          <td style="padding:14px 16px;">
            <p style="margin:0 0 4px;font-size:13px;color:#64748b;">
              من: <strong style="color:#1e293b;">${fromName}</strong>
              <span style="background:#e2e8f0;padding:2px 8px;border-radius:4px;font-family:monospace;font-size:12px;margin-right:8px;">${fromEmployeeId}</span>
            </p>
            <p style="margin:0;font-size:13px;color:#64748b;">الموضوع: <strong style="color:#1e293b;">${subject}</strong></p>
          </td>
        </tr>
      </table>
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;white-space:pre-wrap;line-height:1.8;color:#374151;font-size:14px;">
${body}
      </div>
      ${actionButton("عرض في النظام الداخلي", `${appUrl}/employee/mail`, "#1d4ed8")}
    `,
  }),

  // ── 6. Custom/Broadcast Email ─────────────────────────────────────────
  customEmail: (subject: string, content: string) => ({
    subject,
    html: `<div style="white-space:pre-wrap;line-height:1.9;color:#374151;font-size:15px;">${content}</div>`,
  }),

  // ── 7. Password Reset ─────────────────────────────────────────────────
  passwordReset: (name: string, resetLink: string) => ({
    subject: `إعادة تعيين كلمة المرور — ${ORG_NAME}`,
    html: `
      <h2 style="color:#059669;margin-top:0;">طلب إعادة تعيين كلمة المرور</h2>
      <p>مرحباً <strong>${name}</strong>،</p>
      <p>تلقينا طلباً لإعادة تعيين كلمة مرور حسابك. إذا لم تطلب ذلك، يمكنك تجاهل هذا البريد.</p>
      ${actionButton("إعادة تعيين كلمة المرور", resetLink, "#dc2626")}
      ${alertBox("⚠️ هذا الرابط صالح لمدة ساعة واحدة فقط.", "warning")}
    `,
  }),

  // ── 8. Job Application Received ──────────────────────────────────────
  jobApplicationReceived: (applicantName: string, jobTitle: string, department?: string) => ({
    subject: `✅ تم استلام طلبك — ${jobTitle} | ${ORG_NAME}`,
    html: `
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-block;background:#f0fdf4;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">📨</div>
        <h2 style="color:#059669;margin:12px 0 4px;font-size:22px;">تم استلام طلبك بنجاح!</h2>
        <p style="color:#64748b;margin:0;font-size:14px;">شكراً لاهتمامك بالانضمام إلى فريقنا</p>
      </div>
      <p>مرحباً <strong>${applicantName}</strong>،</p>
      <p>يسعدنا إبلاغك بأننا استلمنا طلبك للتوظيف وسيتم مراجعته من قِبل فريق الموارد البشرية لدينا.</p>
      ${infoBox([
        { label: "الوظيفة المتقدم لها", value: jobTitle },
        ...(department ? [{ label: "القسم", value: department }] : []),
        { label: "الجمعية", value: ORG_NAME },
        { label: "تاريخ التقديم", value: new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
        { label: "حالة الطلب", value: "قيد المراجعة" },
      ], "#059669")}
      ${alertBox("⏳ تستغرق مراجعة الطلبات عادةً من 3 إلى 7 أيام عمل. سنتواصل معك على هذا البريد الإلكتروني بمجرد اتخاذ القرار.", "info")}
      <p style="color:#64748b;font-size:13px;margin-top:20px;">إذا كان لديك أي استفسار، لا تتردد في التواصل معنا عبر <a href="${APP_URL}/contact" style="color:#059669;">صفحة التواصل</a>.</p>
      <p style="color:#64748b;font-size:13px;">نتمنى لك التوفيق 🌿</p>
    `,
  }),

  // ── 9. Test Email ─────────────────────────────────────────────────────
  testEmail: (adminName: string) => ({
    subject: `[اختبار] النظام البريدي يعمل بنجاح — ${ORG_NAME}`,
    html: `
      <h2 style="color:#059669;margin-top:0;">✓ النظام البريدي يعمل</h2>
      <p>مرحباً <strong>${adminName}</strong>،</p>
      <p>هذه رسالة اختبار تؤكد أن نظام البريد الإلكتروني لـ ${ORG_NAME} يعمل بشكل صحيح على بيئة الإنتاج (Render).</p>
      ${infoBox([
        { label: "البيئة", value: process.env.NODE_ENV || "production" },
        { label: "المزوّد", value: process.env.SMTP2GO_API_KEY ? "SMTP2GO HTTP API" : "SMTP" },
        { label: "وقت الاختبار", value: new Date().toLocaleString("ar-SA") },
        { label: "الترخيص", value: ORG_LICENSE },
      ], "#059669")}
      ${alertBox("✓ جميع مكونات النظام البريدي تعمل بشكل سليم.", "success")}
    `,
  }),
};

// =============================================
// STARTUP VERIFICATION
// =============================================
if (process.env.SMTP2GO_API_KEY) {
  console.log("[Mail] Primary: SMTP2GO HTTP API ✓ (Render-compatible)");
} else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  console.log("[Mail] Primary: SMTP (nodemailer)");
  const t = getTransporter();
  t.verify((err) => {
    if (err) console.error("[Mail] SMTP verify error:", err.message);
    else console.log("[Mail] SMTP connection verified ✓");
  });
} else {
  console.warn("[Mail] ⚠ No email transport configured. Set SMTP2GO_API_KEY.");
}
