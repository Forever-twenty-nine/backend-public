import { Router } from "express";
import { requestACourseController } from "@/controllers";

const router = Router();

// Compatibilidad: aceptar POST en la raíz además de la ruta explícita
router.post("/", requestACourseController.createRequestACourse);
router.post(
  "/createRequestACourse",
  requestACourseController.createRequestACourse,
);

export default router;
