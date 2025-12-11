import { Router } from 'express';
import { logger } from '../utils';
import CompanySpecificDataController from '@/controllers/companySpecificData.controller';
import CompanySpecificDataService from '@/services/companySpecificData.service';
import CompanySpecificDataRepository from '@/repositories/companySpecificData.repository';

// Instanciar dependencias
const companySpecificDataRepository = new CompanySpecificDataRepository();
const companySpecificDataService = new CompanySpecificDataService(companySpecificDataRepository);
const companySpecificDataController = new CompanySpecificDataController(companySpecificDataService);

const router = Router();

// Endpoint público para obtener datos de la compañía (políticas, términos, etc.)
router.get('/company-data', companySpecificDataController.getPublicCompanyData);

export default router;