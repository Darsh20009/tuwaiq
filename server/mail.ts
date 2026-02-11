
import nodemailer from "nodemailer";

const SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY || "api-150433934B7744C5B35AB1BCE59B6042";

const transporter = nodemailer.createTransport({
  host: "mail.smtp2go.com",
  port: 2525, // or 587, 80, 25
  auth: {
    user: "smtp2go_user", // This might need to be verified, but usually it's the account email or API key
    pass: SMTP2GO_API_KEY,
  },
});

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) {
  try {
    const info = await transporter.sendMail({
      from: '"Twaq Humanitarian" <noreply@twaq.sa>', // Should be a verified sender
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
