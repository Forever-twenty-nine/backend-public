import { Router } from "express";
import CompanySpecificDataController from "@/controllers/companySpecificData.controller";
import CompanySpecificDataService from "@/services/companySpecificData.service";
import { companySpecificDataRepository } from "@/repositories";

// Instanciar dependencias
const companySpecificDataService = new CompanySpecificDataService(
  companySpecificDataRepository,
);
const companySpecificDataController = new CompanySpecificDataController(
  companySpecificDataService,
);

const router = Router();

// Endpoint público para obtener datos de la compañía (políticas, términos, etc.)
router.get(
  "/",
  companySpecificDataController.getPublicCompanyData,
);

export default router;
