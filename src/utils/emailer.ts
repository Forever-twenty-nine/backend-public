import nodemailer from "nodemailer";
import config from "../config";

export const CORPORATE_MAIL = "info@cursala.com.ar";

/**
 * Type definition for email attachments
 */
export interface EmailAttachment {
  filename: string;
  path?: string;
  content?: Buffer | string;
  contentType?: string;
}

export const sendEmail = async ({
  email,
  subject,
  html,
  attachments,
}: {
  email: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}) => {
  // Skip email sending if credentials are not configured
  if (!config.EMAIL_FROM || !config.EMAIL_PASSWORD) {
    console.warn("Email credentials not configured. Skipping email send.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST || "mail.cursala.com.ar",
    port: config.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: config.EMAIL_FROM,
      pass: config.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: config.EMAIL_FROM,
    to: email,
    subject,
    html,
    ...(attachments && attachments.length > 0 ? { attachments } : {}),
  };

  await transporter.sendMail(mailOptions);
};
