import nodemailer from "nodemailer";
import config from "../config";
import logger from "./logger";

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
  let transporter: nodemailer.Transporter;

  // If configured to use Ethereal, create a test account dynamically
  if (config.EMAIL_USE_ETHEREAL) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    // use the Ethereal account as the from address by default
    config.EMAIL_FROM = config.EMAIL_FROM || testAccount.user;
  } else {
    // Skip email sending if credentials are not configured
    if (!config.EMAIL_FROM || !config.EMAIL_PASSWORD) {
      console.warn("Email credentials not configured. Skipping email send.");
      return;
    }

    transporter = nodemailer.createTransport({
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
  }

  const mailOptions = {
    from: config.EMAIL_FROM,
    to: email,
    subject,
    html,
    ...(attachments && attachments.length > 0 ? { attachments } : {}),
  };

  const info = await transporter.sendMail(mailOptions);

  if (config.EMAIL_USE_ETHEREAL) {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.info("Ethereal preview URL:", preview);
    return { info, previewUrl: preview };
  }

  return info;
};

/**
 * Sends an email and, when an Ethereal preview URL is produced,
 * attaches it to the provided entity under `__etherealPreviewUrl`.
 * This centralizes the logic so callers don't need to replicate it.
 */
export const sendAndAttachPreview = async <T extends object>(
  entity: T,
  mailOptions: {
    email: string;
    subject: string;
    html: string;
    attachments?: EmailAttachment[];
  },
): Promise<T> => {
  try {
    const result = await sendEmail(mailOptions).catch((err) => {
      logger.error("Failed to send notification (sendAndAttachPreview)", err);
      return null as any;
    });

    if (result && (result as any).previewUrl) {
      try {
        (entity as any).__etherealPreviewUrl = (result as any).previewUrl;
      } catch (err) {
        logger.warn("Could not attach Ethereal preview URL to entity", err);
      }
    }
  } catch (err) {
    logger.error("Unexpected error in sendAndAttachPreview", err);
  }

  return entity;
};
