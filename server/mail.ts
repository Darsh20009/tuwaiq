
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.smtp2go.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER || "tuwaiq",
    pass: process.env.SMTP_PASS || "api-8F7AC24E891D4EC6A3856043ABBDD95FSMTP2GO",
  },
});

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) {
  try {
    const info = await transporter.sendMail({
      from: `"Twaq Humanitarian" <${process.env.SMTP_FROM || "noreply@tuwaiq-sa.online"}>`,
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
    html: `<h3>شكراً لتبرعكم</h3><p>شكراً لك يا <strong>${donorName}</strong> على تبرعك بمبلغ <strong>${amount}</strong> ريال سعودي.</p>`,
  }),
  welcome: (name: string) => ({
    subject: "مرحباً بك في منصة طويق",
    text: `مرحباً بك يا ${name} في منصة طويق للخدمات الإنسانية.`,
    html: `<h3>مرحباً بك</h3><p>مرحباً بك يا <strong>${name}</strong> في منصة طويق للخدمات الإنسانية.</p>`,
  }),
};
