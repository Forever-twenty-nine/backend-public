import { NextFunction, Request, Response } from 'express';
import prepareResponse from '../utils/api-response';
import CompanySpecificDataService from '@/services/companySpecificData.service';

export default class CompanySpecificDataController {
  constructor(private readonly companySpecificDataService: CompanySpecificDataService) {}

  /**
   * Obtener datos públicos de la compañía (políticas y términos)
   */
  getPublicCompanyData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.companySpecificDataService.getPublicCompanyData();

      if (!data) {
        return res.status(404).json(prepareResponse(404, 'Datos de la compañía no encontrados'));
      }

      // Devolver solo los campos necesarios para el público
      const publicData = {
        privacyPolicy: data.privacyPolicy,
        termsOfService: data.termsOfService,
      };

      return res.json(prepareResponse(200, 'Datos de la compañía obtenidos correctamente', publicData));
    } catch (error) {
      return next(error);
    }
  };
}