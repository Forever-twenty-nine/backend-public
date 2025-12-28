import { Router } from "express";
import { courseController } from "@/controllers";

const router = Router();

router.get("/home", courseController.findForHome);
router.get("/public/:courseId", courseController.findOnePublic);
router.get("/public", courseController.findPublished);

export default router;
