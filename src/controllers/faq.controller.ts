import { NextFunction, Request, Response } from "express";
import { prepareResponse, logger } from "@/utils";
import FAQService from "@/services/faq.service";
import { validateGetFAQsQuery, validateCategory } from "@/dto";

/**
 * Controlador para manejar operaciones relacionadas con FAQ.
 */
export default class FAQController {
  /**
   * @param {FAQService} faqService - La instancia del servicio para operaciones de FAQ.
   */
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
      res.json(prepareResponse(200, "FAQs obtenidas exitosamente", faqs));
    } catch (error) {
      logger.error("Error in getAllFAQs:", error);
      next(error);
    }
  };

  /**
   * Recupera FAQ por categoría, opcionalmente filtrando por estado activo.
   * @param {Request} req - El objeto de solicitud de Express, con parámetro de ruta 'category' y parámetro de consulta opcional 'activeOnly'.
   * @param {Response} res - El objeto de respuesta de Express.
   * @param {NextFunction} next - La función next de Express para manejo de errores.
   * @returns {Promise<void>} Envía una respuesta JSON con la lista de FAQ o pasa errores a next.
   */
  getFAQsByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const categoryValidation = validateCategory(req.params.category);

      if (!categoryValidation.isValid) {
        res.status(400).json(
          prepareResponse(400, "Validation error", {
            errors: categoryValidation.errors,
          }),
        );
        return;
      }

      const { activeOnly } = validateGetFAQsQuery(req.query);
      const faqs = await this.faqService.getFAQsByCategory(
        categoryValidation.data!,
        activeOnly,
      );
      res.json(prepareResponse(200, "FAQs obtenidas exitosamente", faqs));
    } catch (error) {
      logger.error("Error in getFAQsByCategory:", error);
      next(error);
    }
  };

  /**
   * Recupera todas las categorías disponibles de FAQ.
   * @param {Request} req - El objeto de solicitud de Express.
   * @param {Response} res - El objeto de respuesta de Express.
   * @param {NextFunction} next - La función next de Express para manejo de errores.
   * @returns {Promise<void>} Envía una respuesta JSON con la lista de categorías o pasa errores a next.
   */
  getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const categories = await this.faqService.getCategories();
      res.json(
        prepareResponse(200, "Categorías obtenidas exitosamente", categories),
      );
    } catch (error) {
      logger.error("Error in getCategories:", error);
      next(error);
    }
  };
}
