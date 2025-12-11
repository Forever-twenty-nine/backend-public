import express, { Express, Router } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import { middleware } from 'express-openapi-validator';
import process from 'process';
import util from 'util';
import { errorLogger, logger as loggerMiddleware } from 'express-winston';
import { globalLimiter } from '@/middlewares/rateLimit.middleware';

import { logger } from '../utils';
import config from '@/config';

interface NodeServer {
  start(): void;
  stop(exitCode?: number): void;
}

export default class Server implements NodeServer {
  private app: Express;

  private server: http.Server;

  constructor(
    private readonly port: number,
    private readonly routes: Router[],
    private readonly setErrorHandlers: (app: Express) => void
  ) {
    this.app = express();
    this.server = http.createServer(this.app);
    // Basic runtime validations for production secrets
    if (config.NODE_ENV === 'production') {
      // No secrets required for public API
    }
    this.setServerConfig();
    this.setListeners();
  }

  start(): void {
    this.server.listen(this.port, () => {
      logger.info(`⚡ Listening on ${this.port}`);
    });
  }

  stop(exitCode = 0): void {
    logger.info(`Stopping server. Waiting for connections to end...`);
    this.server.close(() => {
      logger.info(`Server closed successfully`);
      process.exit(exitCode);
    });
  }

  setServerConfig(): void {
    this.app.set('port', this.port);
    this.app.set('trust proxy', 1);
    // Disable X-Powered-By to avoid leak of Express
    this.app.disable('x-powered-by');

    // Seguridad y optimización
    // Helmet default config. Enable CSP in production for stricter security.
    this.app.use(
      helmet({
        contentSecurityPolicy: config.NODE_ENV === 'production',
      })
    );
    this.app.use(
      compression({
        filter: (req, res) => {
          if (req.url.includes('/api/v1/class/') && req.url.endsWith('/video')) {
            return false;
          }
          return compression.filter(req, res);
        },
      })
    );
    // CORS configuration: prefer a specific frontend origin in production
    // Allow configuring multiple origins in `FRONTEND_DOMAIN` using comma-separated values.
    let corsOptions: any;
    if (config.FRONTEND_DOMAIN) {
      const allowed = String(config.FRONTEND_DOMAIN)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      corsOptions = {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          // Allow non-browser or server-to-server requests (no Origin header)
          if (!origin) return callback(null, true);
          if (allowed.includes(origin)) return callback(null, true);
          return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        optionsSuccessStatus: 200,
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Authorization']
      };
    } else {
      corsOptions = { origin: true, credentials: true };
    }

    this.app.use(cors(corsOptions));

    // ⭐ CAMBIO 1: Configurar timeouts del servidor para mitigar DoS por conexiones largas
    this.server.setTimeout(2 * 60 * 1000); // 2 minutos
    // headersTimeout should be slightly larger than server timeout (node defaults: 40000). Keep safe values
    this.server.headersTimeout = 2 * 60 * 1000; // 2 minutos

    // ⭐ CAMBIO 2: Ajustar límites de parsing; usar límites realistas. Los uploads con multer deberían controlar tamaños por ruta.
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true, parameterLimit: 100000 }));

    // ⭐ CAMBIO 3: Remover estas líneas duplicadas
    // this.app.use(express.urlencoded({ extended: true }));
    // this.app.use(express.json());

    // Logger
    this.app.use(
      loggerMiddleware({
        winstonInstance: logger,
        expressFormat: true,
        colorize: true,
        meta: false,
      })
    );

    // this.app.use(
    //   middleware({
    //    apiSpec: config.DIR_SWAGGER || '',
    //  validateResponses: false,
    //  validateRequests: true,

    // validateSecurity: config.NODE_ENV === 'production',
    //   ignorePaths: /\/.*\/?/,
    // })
    // );

    // Rate limiting middleware global
    this.app.use(globalLimiter);

    // ⭐ Servir archivos estáticos en desarrollo (en producción lo hace nginx)
    if (config.NODE_ENV === 'development') {
      const staticPath = path.join(__dirname, '../static');
      logger.info(`🗂️  Serving static files from: ${staticPath}`);
      this.app.use('/static', express.static(staticPath));

      // Servir archivos estáticos remotos si están montados con SSHFS
      const remoteStaticPath = path.join(__dirname, '../static-remote');
      if (fs.existsSync(remoteStaticPath)) {
        logger.info(`🌐 Serving remote static files from: ${remoteStaticPath}`);
        this.app.use('/static-remote', express.static(remoteStaticPath));
      } else {
        logger.warn(
          `⚠️  Remote static files not mounted. Run ./mount-remote-static.sh to access production images.`
        );
      }
    }

    // Definir rutas
    this.app.use(config.BASE_URL, ...this.routes);

    // Middleware de logging de errores
    this.app.use(
      errorLogger({
        winstonInstance: logger,
      })
    );

    // Custom error handlers
    this.setErrorHandlers(this.app);
  }

  setListeners(): void {
    process.on('uncaughtException', (error: Error, origin: string) => {
      logger.error(`Caught exception:\n${util.format(error)}`);
      logger.error(`Origin: ${origin}`);

      // ⭐ CAMBIO 5: No cerrar servidor por errores de upload
      if (error.message.includes('Unexpected end of form') || error.message.includes('maxFileSize exceeded')) {
        logger.warn('Upload error detected, server continues running');
        return;
      }

      this.stop(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.warn(`Unhandled Rejection at:\n${util.format(promise)}`);
    });

    process.on('SIGINT', () => {
      logger.info(`SIGINT signal received`);
      this.stop(0);
    });

    process.on('SIGTERM', () => {
      logger.info(`SIGTERM signal received`);
      this.stop(0);
    });

    process.on('exit', (code) => {
      logger.info(`Exiting with code ${code}`);
    });
  }
}
