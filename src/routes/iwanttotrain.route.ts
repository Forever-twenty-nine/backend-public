import { Router } from 'express';
import { iWantToTrainController } from '@/controllers';

const router = Router();

router.post('/createIWantToTrain', iWantToTrainController.createIWantToTrain);

export default router;
