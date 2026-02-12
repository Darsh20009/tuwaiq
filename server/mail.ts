
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.smtp2go.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER || "tuwaiq",
    pass: process.env.SMTP_PASS || "tuwaiq123",
  },
});

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) {
  try {
    const from = process.env.SMTP_FROM || "noreply@tuwaiq-sa.online";
    const info = await transporter.sendMail({
      from: `"Tuwaiq Association" <${from}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export const emailTemplates = {
  donationReceived: (donorName: string, amount: string) => ({
    subject: "شكراً لتبرعكم - منصة طويق",
    text: `شكراً لك يا ${donorName} على تبرعك بمبلغ ${amount} ريال سعودي.`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #059669;">شكراً لتبرعكم</h2>
        <p>مرحباً <strong>${donorName}</strong>،</p>
        <p>لقد تلقينا تبرعك بمبلغ <strong>${amount}</strong> ريال سعودي بنجاح.</p>
        <p>نسأل الله أن يبارك لك في مالك وأن يجعلها في ميزان حسناتك.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280;">منصة طويق للخدمات الإنسانية</p>
      </div>
    `,
  }),
  welcome: (name: string) => ({
    subject: "مرحباً بك في منصة طويق",
    text: `مرحباً بك يا ${name} في منصة طويق للخدمات الإنسانية.`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #059669;">مرحباً بك</h2>
        <p>مرحباً بك يا <strong>${name}</strong> في منصة طويق للخدمات الإنسانية.</p>
        <p>يسعدنا انضمامك إلينا للمساهمة في عمل الخير.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280;">منصة طويق للخدمات الإنسانية</p>
      </div>
    `,
  }),
  customEmail: (subject: string, content: string) => ({
    subject: subject,
    text: content,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #059669;">رسالة من منصة طويق</h2>
        <div style="white-space: pre-wrap;">${content}</div>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280;">منصة طويق للخدمات الإنسانية</p>
      </div>
    `,
  }),
};
