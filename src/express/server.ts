import express, { Express, Router } from 'express';
import http from 'http';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
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

    // Set a timeout to force shutdown if graceful shutdown takes too long
    const forceShutdownTimeout = setTimeout(() => {
      logger.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 30000); // 30 seconds timeout

    this.server.close(() => {
      clearTimeout(forceShutdownTimeout);
      logger.info(`Server closed successfully`);
      process.exit(exitCode);
    });
  }

  setServerConfig(): void {
    this.app.set('port', this.port);
    this.app.set('trust proxy', 1);
    // Disable X-Powered-By to avoid leak of Express
    this.app.disable('x-powered-by');

    // Security and optimization
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
    let corsOptions: cors.CorsOptions;
    if (config.FRONTEND_DOMAIN) {
      const allowed = String(config.FRONTEND_DOMAIN)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      corsOptions = {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          // For public read-only API: Be strict about CORS in production
          if (config.NODE_ENV === 'production') {
            if (!origin) return callback(new Error('Origin header required in production'));
            if (allowed.includes(origin)) return callback(null, true);
            return callback(new Error('Not allowed by CORS'));
          }
          // In development, allow requests without origin (e.g., Postman, server-to-server)
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
      // Fallback for development only
      corsOptions = {
        origin: config.NODE_ENV === 'production' ? false : true,
        credentials: true
      };
    }

    this.app.use(cors(corsOptions));

    // Configure server timeouts to mitigate DoS attacks
    this.server.setTimeout(2 * 60 * 1000); // 2 minutes
    this.server.headersTimeout = 65000; // Slightly larger than default keepAlive (60s)
    this.server.keepAliveTimeout = 61000; // Slightly larger than typical load balancer timeout (60s)
    this.server.requestTimeout = 2 * 60 * 1000; // 2 minutes

    // Request body parsing limits - strict for read-only public API
    // No file uploads expected in a read-only API
    this.app.use(express.json({ limit: '1mb' })); // Reduced from 10mb
    this.app.use(express.urlencoded({ limit: '1mb', extended: true, parameterLimit: 1000 })); // Reduced from 100000

    // Logger
    this.app.use(
      loggerMiddleware({
        winstonInstance: logger,
        expressFormat: true,
        colorize: true,
        meta: false,
      })
    );

    // Rate limiting middleware global
    this.app.use(globalLimiter);

    // Note: backend-public does NOT serve local images. Images must come from
    // Bunny CDN or be shown as placeholder. We don't mount express.static.

    // Register routes with validation
    for (const route of this.routes) {
      if (this.isValidRouter(route)) {
        this.app.use(config.BASE_URL, route);
      } else {
        logger.warn('Skipping invalid route entry during registration');
      }
    }

    // Error logging middleware
    this.app.use(
      errorLogger({
        winstonInstance: logger,
      })
    );

    // Custom error handlers
    this.setErrorHandlers(this.app);
  }

  private isValidRouter(route: Router): route is Router {
    return route && typeof (route as any).use === 'function';
  }

  setListeners(): void {
    process.on('uncaughtException', (error: Error, origin: string) => {
      logger.error(`Caught exception:\n${util.format(error)}`);
      logger.error(`Origin: ${origin}`);
      logger.error(`Stack: ${error.stack}`);

      // For a read-only API, any uncaught exception is critical
      // Stop the server to prevent undefined state
      this.stop(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`Unhandled Rejection at:\n${util.format(promise)}`);
      logger.error(`Reason: ${util.format(reason)}`);
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
