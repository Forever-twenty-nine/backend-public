import { NextFunction, Request, Response } from "express";
import { prepareResponse, logger } from "@/utils";
import RequestACourseService from "@/services/requestACourse.service";
import { validateCreateRequestACourseDTO } from "@/dto";

export default class RequestACourseController {
  constructor(private readonly requestACourseService: RequestACourseService) {}

  /**
   * Crea una nueva entrada de RequestACourse.
   * @param {Request} req - El objeto de solicitud de Express, con los datos en el body.
   * @param {Response} res - El objeto de respuesta de Express.
   * @param {NextFunction} next - La función next de Express para manejo de errores.
   * @returns {Promise<void>} Envía una respuesta JSON con el nuevo RequestACourse creado o pasa errores a next.
   */
  createRequestACourse = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validation = validateCreateRequestACourseDTO(req.body);

      if (!validation.isValid) {
        res.status(400).json(
          prepareResponse(400, "Validation error", {
            errors: validation.errors,
          }),
        );
        return;
      }

      const newRequestACourse = await this.requestACourseService.create(
        validation.data!,
      );
      res
        .status(201)
        .json(
          prepareResponse(
            201,
            "RequestACourse creado exitosamente",
            newRequestACourse,
          ),
        );
    } catch (error) {
      logger.error("Error in createRequestACourse:", error);
      next(error);
    }
  };
}
