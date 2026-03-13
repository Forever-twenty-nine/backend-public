import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import config from '../config';

/**
 * Type definition for email attachments
 */
export interface EmailAttachment {
  filename: string;
  path?: string;
  content?: Buffer | string;
  contentType?: string;
}

// Singleton: cuenta Ethereal creada una sola vez al arrancar el servidor
let devTransporter: nodemailer.Transporter | null = null;

const getDevTransporter = async (): Promise<nodemailer.Transporter | null> => {
  if (devTransporter) return devTransporter;

  try {
    const testAccount = await nodemailer.createTestAccount();
    devTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    // eslint-disable-next-line no-console
    console.log('\n✅ [ETHEREAL] Cuenta de prueba creada:', testAccount.user);
    // eslint-disable-next-line no-console
    console.log('   Bandeja: https://ethereal.email/messages\n');
    return devTransporter;
  } catch {
    // eslint-disable-next-line no-console
    console.warn('⚠️ [ETHEREAL] No se pudo conectar a Ethereal, usando archivos locales como fallback.');
    return null;
  }
};

const saveEmailToFile = (email: string, subject: string, html: string) => {
  try {
    const emailsDir = path.join(process.cwd(), 'logs', 'emails');
    if (!fs.existsSync(emailsDir)) {
      fs.mkdirSync(emailsDir, { recursive: true });
    }
    const safeEmail = email.replace(/[@.]/g, '_');
    const fileName = `${Date.now()}-${safeEmail}.html`;
    fs.writeFileSync(path.join(emailsDir, fileName), html, 'utf-8');
    // eslint-disable-next-line no-console
    console.log(`  📁 Fallback → logs/emails/${fileName}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('⚠️ No se pudo guardar el email local:', err);
  }
};

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
  const isDevelopment = config.NODE_ENV === 'development';

  if (isDevelopment) {
    const transporter = await getDevTransporter();

    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: '"Cursala (Dev)" <no-reply@cursala.dev>',
          to: email,
          subject,
          html,
          ...(attachments && attachments.length > 0 ? { attachments } : {}),
        });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        // eslint-disable-next-line no-console
        console.log('\n📧 [ETHEREAL EMAIL ENVIADO]');
        // eslint-disable-next-line no-console
        console.log(`  Para:   ${email}`);
        // eslint-disable-next-line no-console
        console.log(`  Asunto: ${subject}`);
        // eslint-disable-next-line no-console
        console.log(`  ➜ Ver email: ${previewUrl}\n`);
      } catch {
        // eslint-disable-next-line no-console
        console.warn(`\n⚠️ [ETHEREAL] Falló el envío, guardando en archivo.`);
        saveEmailToFile(email, subject, html);
      }
    } else {
      saveEmailToFile(email, subject, html);
    }
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST || 'mail.cursala.com.ar',
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

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error enviando email:', error);
    throw error;
  }
};
