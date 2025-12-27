import { Request, Response, NextFunction } from "express";
import { maskSensitiveFields } from "@/utils";

/**
 * Middleware que enmascara campos sensibles en `req.body` y headers antes de que los loggers los procesen.
 */
export default function maskSensitiveMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (req.body) {
      // Reemplaza body por su versión enmascarada

      (req as any).body = maskSensitiveFields(req.body);
    }

    // Enmascarar headers sensibles sin exponer valores

    const headers = (req as any).headers as Record<string, unknown> | undefined;
    if (headers) {
      const safeHeaders = { ...headers } as Record<string, unknown>;
      if (safeHeaders.authorization) safeHeaders.authorization = "***";
      if (safeHeaders.cookie) safeHeaders.cookie = "***";
      (req as any).headers = safeHeaders;
    }
  } catch {
    // No bloquear la petición por errores de enmascarado
  }

  next();
}
