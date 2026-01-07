import nodemailer from "nodemailer";
import config from "../config";
import logger from "./logger";

export const CORPORATE_MAIL = "info@cursala.com.ar";

// Brand colors (copied from frontend variables)
const BRAND = {
  primary: '#0081c2',
  primaryDark: '#00385b',
  secondary: '#e6b800',
  tertiary: '#262626',
  tertiaryLight: '#444444',
  tertiaryLighten: '#666666',
};

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
  text,
  attachments,
}: {
  email: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}) => {
  let transporter: nodemailer.Transporter;

  // Use Ethereal in development or when explicitly configured
  const useEthereal = config.EMAIL_USE_ETHEREAL || config.NODE_ENV === "development";
  if (useEthereal) {
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

  const mailOptions: any = {
    from: config.EMAIL_FROM,
    to: email,
    subject,
    html,
    ...(text ? { text } : {}),
    ...(attachments && attachments.length > 0 ? { attachments } : {}),
  };

  const info = await transporter.sendMail(mailOptions);

  if (useEthereal) {
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
  previewFieldName = "__etherealPreviewUrl",
): Promise<T> => {
  try {
    const result = await sendEmail(mailOptions).catch((err) => {
      logger.error("Failed to send notification (sendAndAttachPreview)", err);
      return null as any;
    });

    if (result && (result as any).previewUrl) {
      try {
        (entity as any)[previewFieldName] = (result as any).previewUrl;
      } catch (err) {
        logger.warn("Could not attach Ethereal preview URL to entity", err);
      }
    }
  } catch (err) {
    logger.error("Unexpected error in sendAndAttachPreview", err);
  }

  return entity;
};

/**
 * Build a simple, clean HTML notification for new contacts/submissions.
 * `title` is a short subject/title shown in the email body.
 * `data` is an object with the submitted fields.
 */
export const buildContactHtml = (title: string, data: Record<string, unknown>) => {
  const formatKey = (k: string) =>
    k
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (s) => s.toUpperCase());

  // Filtrar campos relevantes (excluir id de la visualización de datos)
  const relevantData = Object.entries(data).filter(([k]) => k !== 'id');
  
  const rows = relevantData
    .map(([k, v]) => {
      const label = formatKey(k);
      const value = String(v ?? "");
      return `
        <div style="margin-bottom:16px">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:${BRAND.tertiaryLighten};margin-bottom:4px;font-weight:600">${label}</div>
          <div style="font-size:15px;color:${BRAND.tertiary};line-height:1.4">${value}</div>
        </div>`;
    })
    .join("");

  const siteUrl = config.FRONTEND_URL || config.FRONTEND_DOMAIN || "#";

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f5f7fb; padding:32px 16px; color:#222">
    <div style="max-width:600px;margin:0 auto">
      <div style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
        
        <!-- Header -->
        <div style="padding:32px 32px 24px;background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.primaryDark} 100%);text-align:center">
          <img src="https://cursala.b-cdn.net/PUBLIC-FRONTEND/logo-cursala.png" alt="Cursala" style="width:64px;height:64px;object-fit:contain;margin:0 auto 16px" />
          <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff;line-height:1.2">Nuevo Contacto</h1>
          <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85)">${title.replace('Nuevo ', '').replace(' recibido', '')}</p>
        </div>

        <!-- Body -->
        <div style="padding:32px">
          ${rows}
          
          <div style="margin-top:32px;padding-top:24px;border-top:2px solid #f0f0f0;text-align:center">
            <a href="${siteUrl}" style="display:inline-block;background:${BRAND.secondary};color:${BRAND.tertiary};padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 2px 8px rgba(230,184,0,0.3)">Ir al Panel</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:20px 32px;background:#fafafa;text-align:center;border-top:1px solid #e8e8e8">
          <p style="margin:0;font-size:12px;color:${BRAND.tertiaryLight}">Equipo Cursala • Envío automático</p>
          ${data.id ? `<p style="margin:8px 0 0;font-size:11px;color:${BRAND.tertiaryLighten};font-family:monospace">ID: ${String(data.id)}</p>` : ''}
        </div>
      </div>
    </div>
  </div>
  `;
};

export const buildThankYouHtml = (name = "") => {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f5f7fb; padding:32px 16px; color:#222">
    <div style="max-width:500px;margin:0 auto">
      <div style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);text-align:center">
        
        <div style="padding:48px 32px">
          <img src="https://cursala.b-cdn.net/PUBLIC-FRONTEND/logo-cursala.png" alt="Cursala" style="width:72px;height:72px;object-fit:contain;margin:0 auto 24px" />
          <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:${BRAND.primary};line-height:1.2">¡Gracias${name ? `, ${name}` : ''}!</h1>
          <p style="margin:0;font-size:16px;color:${BRAND.tertiary};line-height:1.6">Recibimos tu mensaje.<br/>Nos pondremos en contacto pronto.</p>
          
          <div style="margin-top:32px">
            <a href="${config.FRONTEND_URL ?? config.FRONTEND_DOMAIN ?? "#"}" style="display:inline-block;background:${BRAND.primary};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Visitar Cursala</a>
          </div>
        </div>

        <div style="padding:20px;background:#fafafa;border-top:1px solid #e8e8e8">
          <p style="margin:0;font-size:12px;color:${BRAND.tertiaryLight}">Equipo Cursala</p>
        </div>
      </div>
    </div>
  </div>
  `;
};

export const buildContactText = (title: string, data: Record<string, unknown>) => {
  const lines: string[] = [];
  lines.push(title);
  lines.push("");
  for (const [k, v] of Object.entries(data)) {
    lines.push(`${k}: ${String(v ?? "")}`);
  }
  lines.push("");
  lines.push("Este es un envío automático. No respondas a este correo.");
  return lines.join("\n");
};

export const buildThankYouText = (name = "") => {
  return `Gracias ${name ?? ""} por contactarte con Cursala.\n\nHemos recibido tu mensaje y nos pondremos en contacto a la brevedad.\n\nVisita: ${config.FRONTEND_URL ?? config.FRONTEND_DOMAIN ?? "#"}`;
};
