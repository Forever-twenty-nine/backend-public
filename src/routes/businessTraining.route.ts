import { Router } from "express";
import { businessTrainingController } from "@/controllers";

const router = Router();

// Compatibilidad: aceptar POST en la raíz además de la ruta explícita
router.post(
  "/",
  businessTrainingController.createBusinessTraining,
);

router.post(
  "/createBusinessTraining",
  businessTrainingController.createBusinessTraining,
);

export default router;
