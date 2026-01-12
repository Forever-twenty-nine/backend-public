import { Router } from "express";
import { faqController } from "@/controllers";

const router = Router();

// Public routes (no auth required for reading FAQs)
// Frontend only consumes GET /faqs with optional query `activeOnly`
router.get("/", faqController.getAllFAQs);

export default router;
