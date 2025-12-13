import { NextFunction, Request, Response } from 'express';
import { logger, prepareResponse } from '../utils';
import { bunnyCdnService } from '@/services';

/**
 * BunnyController
 * Controlador para servir recursos desde Bunny CDN
 * Maneja imágenes de cursos y profesores
 */
export default class BunnyController {
  /**
   * Obtiene imagen de curso desde Bunny CDN
   * GET /bunny/course/:imageFileName
   */
  getCourseImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageFileName } = req.params;

      if (!bunnyCdnService.isEnabled()) {
        logger.warn('⚠️  Bunny CDN is not enabled');
        return res.status(503).json(prepareResponse(503, 'CDN service not available'));
      }

      const result = bunnyCdnService.getImageUrl(imageFileName, 'images');
      
      if (!result.success) {
        logger.warn(`⚠️  Failed to get CDN URL: ${result.error}`);
        return res.status(404).json(prepareResponse(404, 'Course image not found'));
      }

      logger.info(`☁️  Course image: ${result.cdnUrl}`);
      return res.redirect(302, result.cdnUrl);
    } catch (error) {
      logger.error('❌ Error in getCourseImage:', error);
      return next(error);
    }
  };

  /**
   * Obtiene imagen de profesor desde Bunny CDN
   * GET /bunny/teacher/:imageFileName
   */
  getTeacherImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageFileName } = req.params;

      if (!bunnyCdnService.isEnabled()) {
        logger.warn('⚠️  Bunny CDN is not enabled');
        return res.status(503).json(prepareResponse(503, 'CDN service not available'));
      }

      // Validar seguridad
      if (imageFileName.includes('..')) {
        logger.warn(`🚨 Path traversal attempt: ${imageFileName}`);
        return res.status(400).json(prepareResponse(400, 'Invalid file name'));
      }

      const folder = 'profile-images';
      const result = bunnyCdnService.getImageUrl(imageFileName, folder);
      
      if (!result.success) {
        logger.warn(`⚠️  Failed to get CDN URL: ${result.error}`);
        return res.status(404).json(prepareResponse(404, 'Teacher image not found'));
      }

      logger.info(`☁️  Teacher image: ${result.cdnUrl}`);
      return res.redirect(302, result.cdnUrl);
    } catch (error) {
      logger.error(`❌ Error in getTeacherImage:`, error);
      return next(error);
    }
  };
}
