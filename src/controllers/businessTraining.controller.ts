import { NextFunction, Request, Response } from "express";
import { prepareResponse, logger } from "@/utils";
import BusinessTrainingService from "@/services/businessTraining.service";
import { validateCreateBusinessTrainingDTO } from "@/dto";

export default class BusinessTrainingController {
  constructor(
    private readonly businessTrainingService: BusinessTrainingService,
  ) {}

  /**
   * Crea una nueva entrada de BusinessTraining.
   * @param {Request} req - El objeto de solicitud de Express, con los datos en el body.
   * @param {Response} res - El objeto de respuesta de Express.
   * @param {NextFunction} next - La función next de Express para manejo de errores.
   * @returns {Promise<void>} Envía una respuesta JSON con el nuevo BusinessTraining creado o pasa errores a next.
   */
  createBusinessTraining = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validation = validateCreateBusinessTrainingDTO(req.body);

      if (!validation.isValid) {
        res.status(400).json(
          prepareResponse(400, "Validation error", {
            errors: validation.errors,
          }),
        );
        return;
      }

      const newBusinessTraining = await this.businessTrainingService.create(
        validation.data!,
      );
      res
        .status(201)
        .json(
          prepareResponse(
            201,
            "BusinessTraining creado exitosamente",
            newBusinessTraining,
          ),
        );
    } catch (error) {
      logger.error("Error in createBusinessTraining:", error);
      next(error);
    }
  };
}
