import { Router } from 'express';
import { userController } from '../controllers';
import { publicFileLimiter } from '@/middlewares/rateLimit.middleware';

const router = Router();

// 🟢 PÚBLICO: Imagen de perfil (con rate limiting para prevenir abuso)
router.get('/user/:imageFileName/image', publicFileLimiter, userController.getUserProfileImage);

export default router;
