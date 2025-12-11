import { Router } from 'express';
import { requestACourseController } from '@/controllers';

const router = Router();

router.post('/createRequestACourse', requestACourseController.createRequestACourse);

export default router;
