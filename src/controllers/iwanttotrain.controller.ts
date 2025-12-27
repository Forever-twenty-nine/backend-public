import { NextFunction, Request, Response } from "express";
import { prepareResponse, logger } from "@/utils";
import IWantToTrainService from "@/services/iwanttotrain.service";
import { validateCreateIWantToTrainDTO } from "@/dto";

export default class IWantToTrainController {
  constructor(private readonly iWantToTrainService: IWantToTrainService) {}

  /**
   * Crea una nueva entrada de IWantToTrain.
   * @param {Request} req - El objeto de solicitud de Express, con los datos en el body.
   * @param {Response} res - El objeto de respuesta de Express.
   * @param {NextFunction} next - La función next de Express para manejo de errores.
   * @returns {Promise<void>} Envía una respuesta JSON con el nuevo IWantToTrain creado o pasa errores a next.
   */
  createIWantToTrain = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validation = validateCreateIWantToTrainDTO(req.body);

      if (!validation.isValid) {
        res.status(400).json(
          prepareResponse(400, "Validation error", {
            errors: validation.errors,
          }),
        );
        return;
      }

      const newIWantToTrain = await this.iWantToTrainService.create(
        validation.data!,
      );
      res
        .status(201)
        .json(
          prepareResponse(
            201,
            "IWantToTrain creado exitosamente",
            newIWantToTrain,
          ),
        );
    } catch (error) {
      logger.error("Error in createIWantToTrain:", error);
      next(error);
    }
  };
}
