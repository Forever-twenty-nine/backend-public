import { Router } from 'express';
import { faqController } from '@/controllers';

const router = Router();

// Public routes (no auth required for reading FAQs)
router.get('/', faqController.getAllFAQs);
router.get('/categories', faqController.getCategories);
router.get('/category/:category', faqController.getFAQsByCategory);

export default router;
