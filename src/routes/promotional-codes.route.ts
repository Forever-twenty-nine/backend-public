import { Router } from 'express';
import { promotionalCodeController } from '@/controllers';

const router = Router();

// Rutas públicas (sin autenticación requerida)
router.post('/courses-with-active', promotionalCodeController.getCoursesWithActivePromotions);

export default router;
