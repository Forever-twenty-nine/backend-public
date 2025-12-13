import { Router } from 'express';
import { publicFileLimiter } from '@/middlewares/rateLimit.middleware';
import { bunnyController } from '@/controllers';

const router = Router();

/**
 * @route GET /bunny/course/:imageFileName
 * @description Obtiene imagen de curso desde Bunny CDN
 * @access Public
 */
router.get('/course/:imageFileName', publicFileLimiter, bunnyController.getCourseImage);

/**
 * @route GET /bunny/teacher/:imageFileName
 * @description Obtiene imagen de profesor desde Bunny CDN
 * @access Public
 */
router.get('/teacher/:imageFileName', publicFileLimiter, bunnyController.getTeacherImage);

export default router;
