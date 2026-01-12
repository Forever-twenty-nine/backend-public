import { Router } from "express";
import { iWantToTrainController } from "@/controllers";

const router = Router();

// Compatibilidad: aceptar POST en la raíz además de la ruta explícita
router.post("/", iWantToTrainController.createIWantToTrain);
router.post("/createIWantToTrain", iWantToTrainController.createIWantToTrain);

export default router;
