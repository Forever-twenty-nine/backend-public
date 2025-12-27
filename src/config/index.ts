import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootEnv = path.resolve(process.cwd(), ".env");
const distEnv = path.resolve(__dirname, "../../.env");

let envPath: string | undefined;
if (fs.existsSync(rootEnv)) {
  envPath = rootEnv;
} else if (fs.existsSync(distEnv)) {
  envPath = distEnv;
}

if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

if (process.env.NODE_ENV === "production" && fs.existsSync(rootEnv)) {
  console.warn(
    "SECURITY WARNING: Detected a `.env` file in production environment. This may leak secrets. Remove .env and use environment/secret manager.",
  );
}

// Set the NODE_ENV environment variable to 'development' if not already defined
process.env.NODE_ENV = process.env.NODE_ENV ?? "development";

export default {
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT ?? 8081),
  BASE_URL: "/api/v1",
  DIR_ERRORS: path.resolve(__dirname, "../../src/config/errors/error.yml"),
  DATABASE_URL: String(process.env.DATABASE_URL),

  // SMTP para envío de correos
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: Number(process.env.EMAIL_PORT),

  // Notificaciones y correos de contacto
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL,
  NO_REPLY_EMAIL: process.env.NO_REPLY_EMAIL,
  INFO_EMAIL: process.env.INFO_EMAIL,
  ADMINISTRATION_EMAIL: process.env.ADMINISTRATION_EMAIL,

  // Email
  FRONTEND_DOMAIN: process.env.FRONTEND_DOMAIN,
};
