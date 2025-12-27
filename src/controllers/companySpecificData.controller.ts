import { NextFunction, Request, Response } from "express";
import { prepareResponse, logger } from "@/utils";
import CompanySpecificDataService from "@/services/companySpecificData.service";

export default class CompanySpecificDataController {
  constructor(
    private readonly companySpecificDataService: CompanySpecificDataService,
  ) {}

  /**
   * Obtiene los datos públicos de la compañía, como políticas de privacidad y términos de servicio.
   * @param {Request} req - El objeto de solicitud de Express.
   * @param {Response} res - El objeto de respuesta de Express.
   * @param {NextFunction} next - La función next de Express para manejo de errores.
   * @returns {Promise<void>} Envía una respuesta JSON con los datos públicos o 404 si no se encuentran, o pasa errores a next.
   */
  getPublicCompanyData = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.companySpecificDataService.getPublicCompanyData();

      if (!data) {
        res
          .status(404)
          .json(prepareResponse(404, "Datos de la compañía no encontrados"));
        return;
      }

      const publicData = {
        privacyPolicy: data.privacyPolicy,
        termsOfService: data.termsOfService,
      };

      res.json(
        prepareResponse(
          200,
          "Datos de la compañía obtenidos correctamente",
          publicData,
        ),
      );
    } catch (error) {
      logger.error("Error in getPublicCompanyData:", error);
      next(error);
    }
  };
}
