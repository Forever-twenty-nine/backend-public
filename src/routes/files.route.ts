import { Router } from 'express';
import { publicFileLimiter } from '@/middlewares/rateLimit.middleware';
import { fileController } from '@/controllers';

const router = Router();

/**
 * @route GET /file/:imageFileName/image
 * @description Obtiene la imagen de un archivo.
 * @access Public (con rate limiting para prevenir abuso)
 */
router.get('/file/:imageFileName/image', publicFileLimiter, fileController.getFileImage);

/**
 * @route GET /file/:publicFile/publicdownload
 * @description Descarga un archivo público.
 * @access Public (con rate limiting para prevenir abuso)
 */
router.get('/file/:publicFile/publicdownload', publicFileLimiter, fileController.getPublicFile);

/**
 * @route GET /direct
 * @description Obtiene archivos directamente por ruta.
 * @access Public/Private depending on action
 * @query path - Ruta del archivo (ej: /file/nombreArchivo/image)
 * @query auth - Token JWT para acciones protegidas (opcional)
 */
router.get('/direct', fileController.getDirectFile);

export default router;
