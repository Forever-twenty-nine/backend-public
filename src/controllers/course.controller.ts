import { NextFunction, Request, Response } from "express";
import { prepareResponse, logger } from "@/utils";
import { courseService } from "@/services";
import { parseCourseQuery } from "@/dto";

export default class CourseController {
  constructor(private readonly service = courseService) {}

  /**
   * Recupera los cursos destacados para la página de inicio.
   * @param {Request} req - El objeto de solicitud de Express.
   * @param {Response} res - El objeto de respuesta de Express.
   * @param {NextFunction} next - La función next de Express para manejo de errores.
   * @returns {Promise<void>} Envía una respuesta JSON con los cursos o pasa errores a next.
   */
  findForHome = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const items = await this.service.findForHome();
      res.json(
        prepareResponse(
          200,
          "Cursos para inicio obtenidos exitosamente",
          items,
        ),
      );
    } catch (err) {
      logger.error("Error al obtener cursos para inicio:", err);
      next(err);
    }
  };

  /**
   * Recupera cursos publicados con paginación y filtros opcionales.
   * @param {Request} req - El objeto de solicitud de Express, con parámetros de consulta opcionales 'page' y 'size'.
   * @param {Response} res - El objeto de respuesta de Express.
   * @param {NextFunction} next - La función next de Express para manejo de errores.
   * @returns {Promise<void>} Envía una respuesta JSON con los cursos paginados o pasa errores a next.
   */
  findPublished = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validation = parseCourseQuery(req.query);

      if (!validation.isValid) {
        res.status(400).json(
          prepareResponse(400, "Error de validación", {
            errors: validation.errors,
          }),
        );
        return;
      }

      const { page, size, filters } = validation.data!;
      const result = await this.service.findPublished(page, size, filters);
      res.json(
        prepareResponse(
          200,
          "Cursos publicados obtenidos exitosamente",
          result,
        ),
      );
    } catch (err) {
      logger.error("Error al obtener cursos publicados:", err);
      next(err);
    }
  };

  /**
   * Recupera un curso público por su ID.
   * @param {Request} req - Parámetro 'courseId'.
   * @param {Response} res - respuesta de Express.
   * @param {NextFunction} next - La función next de Express para manejo de errores.
   * @returns {Promise<void>} Envía una respuesta JSON con el curso o 404 si no se encuentra, o pasa errores a next.
   */
  findOnePublic = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { courseId } = req.params;

      if (!courseId || typeof courseId !== "string" || courseId.trim() === "") {
        res.status(400).json(prepareResponse(400, "ID de curso inválido"));
        return;
      }

      const course = await this.service.findOnePublic(courseId);

      if (!course) {
        res.status(404).json(prepareResponse(404, "Curso público no encontrado"));
        return;
      }

      res.json(prepareResponse(200, "Curso público obtenido exitosamente", course));
    } catch (err) {
      logger.error("Error al obtener curso público:", err);
      next(err);
    }
  };
}
