import { NextFunction, Request, Response } from "express";
import { prepareResponse, logger } from "@/utils";
import AppError from "@/config/errors/app-error";
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
      if (!newIWantToTrain) {
        res
          .status(500)
          .json(prepareResponse(500, "No se pudo crear IWantToTrain", null));
        return;
      }

      res.status(201).json(
        prepareResponse(201, "IWantToTrain creado exitosamente", newIWantToTrain),
      );
    } catch (error) {
      logger.error("Error in createIWantToTrain:", error);

      // Si el servicio lanzó un `AppError`, mapeamos a una respuesta HTTP
      if (error instanceof AppError) {
        const status = error.status || 500;
        const message = error.message || null;
        const errors = error.errors || (error.key || message ? [{ message, key: error.key }] : undefined);
        res.status(status).json(prepareResponse(status, message, null, undefined, errors));
        return;
      }

      // Si el error tiene campo `status` (por compatibilidad), mapear también
      if (error && (error as any).status) {
        const err: any = error;
        const status = err.status || 500;
        const message = err.message || null;
        const errors = err.errors || (err.key || message ? [{ message, key: err.key }] : undefined);
        res.status(status).json(prepareResponse(status, message, null, undefined, errors));
        return;
      }

      // Errores no mapeados se delegan al middleware de errores global
      next(error);
    }
  };
}
