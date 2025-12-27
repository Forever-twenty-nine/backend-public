import express, { Express, Router } from "express";
import http from "http";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import process from "process";
import util from "util";
import { errorLogger, logger as loggerMiddleware } from "express-winston";
import maskSensitiveMiddleware from "@/middlewares/maskSensitive.middleware";
import maskResponseMiddleware from "@/middlewares/maskResponse.middleware";
import { globalLimiter } from "@/middlewares/rateLimit.middleware";

import { logger } from "../utils";
import config from "@/config";

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
    private readonly setErrorHandlers: (app: Express) => void,
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

    const forceShutdownTimeout = setTimeout(() => {
      logger.error("Forcing shutdown after timeout");
      process.exit(1);
    }, 30000);

    this.server.close(() => {
      clearTimeout(forceShutdownTimeout);
      logger.info(`Server closed successfully`);
      process.exit(exitCode);
    });
  }

  /**
   * Set server configurations, middlewares, and routes.
   */
  setServerConfig(): void {
    this.app.set("port", this.port);
    this.app.set("trust proxy", 1);
    this.app.disable("x-powered-by");

    this.app.use(
      helmet({
        contentSecurityPolicy: config.NODE_ENV === "production",
      }),
    );
    this.app.use(
      compression({
        filter: (req, res) => {
          if (
            req.url.includes("/api/v1/class/") &&
            req.url.endsWith("/video")
          ) {
            return false;
          }
          return compression.filter(req, res);
        },
      }),
    );

    let corsOptions: cors.CorsOptions;
    if (config.FRONTEND_DOMAIN) {
      const allowed = String(config.FRONTEND_DOMAIN)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      corsOptions = {
        origin: (
          origin: string | undefined,
          callback: (err: Error | null, allow?: boolean) => void,
        ) => {
          if (config.NODE_ENV === "production") {
            if (!origin)
              return callback(
                new Error("Origin header required in production"),
              );
            if (allowed.includes(origin)) return callback(null, true);
            return callback(new Error("Not allowed by CORS"));
          }
          if (!origin) return callback(null, true);
          if (allowed.includes(origin)) return callback(null, true);
          return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        optionsSuccessStatus: 200,
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Authorization"],
      };
    } else {
      corsOptions = {
        origin: config.NODE_ENV === "production" ? false : true,
        credentials: true,
      };
    }

    this.app.use(cors(corsOptions));

    this.server.setTimeout(2 * 60 * 1000);
    this.server.headersTimeout = 65000;
    this.server.keepAliveTimeout = 61000;
    this.server.requestTimeout = 2 * 60 * 1000;
    this.app.use(express.json({ limit: "1mb" }));
    this.app.use(
      express.urlencoded({
        limit: "1mb",
        extended: true,
        parameterLimit: 1000,
      }),
    );

    // Mask sensitive fields before logging
    this.app.use(maskSensitiveMiddleware);

    // Logger (express-winston)
    this.app.use(
      loggerMiddleware({
        winstonInstance: logger,
        expressFormat: true,
        colorize: true,
        meta: false,
      }),
    );

    this.app.use(globalLimiter);

    for (const route of this.routes) {
      if (this.isValidRouter(route)) {
        this.app.use(config.BASE_URL, route);
      } else {
        logger.warn("Skipping invalid route entry during registration");
      }
    }

    // Mask responses before error logger logs them
    this.app.use(maskResponseMiddleware);

    this.app.use(
      errorLogger({
        winstonInstance: logger,
      }),
    );

    this.setErrorHandlers(this.app);
  }

  private isValidRouter(route: Router): route is Router {
    return route && typeof (route as any).use === "function";
  }

  /**
   * Set process-level listeners for uncaught exceptions, unhandled rejections, and termination signals.
   * These listeners help in logging critical errors and gracefully shutting down the server.
   */
  setListeners(): void {
    process.on("uncaughtException", (error: Error, origin: string) => {
      logger.error(`Caught exception:\n${util.format(error)}`);
      logger.error(`Origin: ${origin}`);
      logger.error(`Stack: ${error.stack}`);

      this.stop(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error(`Unhandled Rejection at:\n${util.format(promise)}`);
      logger.error(`Reason: ${util.format(reason)}`);
    });

    process.on("SIGINT", () => {
      logger.info(`SIGINT signal received`);
      this.stop(0);
    });

    process.on("SIGTERM", () => {
      logger.info(`SIGTERM signal received`);
      this.stop(0);
    });

    process.on("exit", (code) => {
      logger.info(`Exiting with code ${code}`);
    });
  }
}
