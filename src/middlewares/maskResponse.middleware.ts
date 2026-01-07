import { Request, Response, NextFunction } from "express";
import { maskSensitiveFields } from "@/utils";

/**
 * Middleware that wraps `res.json` and `res.send` to mask sensitive fields
 * before the response is sent (useful to avoid leaking secrets in logs or
 * in network responses accidentally).
 */
export default function maskResponseMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = (body?: any) => {
    try {
      const safe = maskSensitiveFields(body);
      return originalJson(safe);
    } catch {
      // if masking fails, fall back to original
      return originalJson(body);
    }
  };

  res.send = (body?: any) => {
    try {
      // only attempt to mask JSON-like bodies
      const parsed =
        typeof body === "string" && body.length > 0
          ? (() => {
              try {
                return JSON.parse(body);
              } catch {
                return null;
              }
            })()
          : body;

      if (parsed) {
        const safe = maskSensitiveFields(parsed);
        return originalSend(
          typeof body === "string" ? JSON.stringify(safe) : safe,
        );
      }

      return originalSend(body);
    } catch {
      return originalSend(body);
    }
  };

  next();
}
