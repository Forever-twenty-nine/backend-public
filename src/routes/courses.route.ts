import { Router } from "express";
import { courseController } from "@/controllers";

const router = Router();

// Compatibilidad: exponer raíz `/courses` para clientes que esperan `/api/v1/courses`
// Devuelve los cursos publicados (mismo comportamiento que `/public`).
router.get("/", courseController.findPublished);

router.get("/home", courseController.findForHome);
router.get("/public/:courseId", courseController.findOnePublic);
router.get("/public", courseController.findPublished);

export default router;
