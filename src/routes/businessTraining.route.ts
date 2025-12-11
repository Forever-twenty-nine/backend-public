import { Router } from 'express';
import { businessTrainingController } from '@/controllers';

const router = Router();

router.post('/createBusinessTraining', businessTrainingController.createBusinessTraining);

export default router;
