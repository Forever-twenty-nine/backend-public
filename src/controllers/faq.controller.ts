import { NextFunction, Request, Response } from "express";
import { prepareResponse, logger } from "@/utils";
import FAQService from "@/services/faq.service";
import { validateGetFAQsQuery } from "@/dto";

export default class FAQController {

  constructor(private readonly faqService: FAQService) {}

  /**
   * Recupera todas las FAQ, opcionalmente filtrando por estado activo.
   * @param {Request} req - El objeto de solicitud de Express, con parámetro de consulta opcional 'activeOnly'.
   * @param {Response} res - El objeto de respuesta de Express.
   * @param {NextFunction} next - La función next de Express para manejo de errores.
   * @returns {Promise<void>} Envía una respuesta JSON con la lista de FAQ o pasa errores a next.
   */
  getAllFAQs = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { activeOnly } = validateGetFAQsQuery(req.query);
      const faqs = await this.faqService.getAllFAQs(activeOnly);
      res.json(prepareResponse(200, "Preguntas frecuentes obtenidas exitosamente", faqs));
    } catch (error) {
      logger.error("Error al obtener preguntas frecuentes:", error);
      next(error);
    }
  };
}
