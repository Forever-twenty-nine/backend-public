import { Router } from 'express';
import { courseController } from '@/controllers';

const router = Router();

// 🟢 PÚBLICO: Consultar cursos disponibles
router.get('/public', courseController.findPublished);
router.get('/home', courseController.findForHome);
router.get('/public/:courseId', courseController.findOnePublic);

export default router;
