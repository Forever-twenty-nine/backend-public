import { NextFunction, Request, Response } from 'express';
import { prepareResponse, logger } from '@/utils';
import { courseService } from '@/services';
import { validatePaginationQuery, CourseFilterDTO } from '@/dto';

export default class CourseController {
  constructor(private readonly service = courseService) {}

  /**
   * Recupera los cursos destacados para la página de inicio.
   * @param {Request} req - El objeto de solicitud de Express.
   * @param {Response} res - El objeto de respuesta de Express.
   * @param {NextFunction} next - La función next de Express para manejo de errores.
   * @returns {Promise<void>} Envía una respuesta JSON con los cursos o pasa errores a next.
   */
  findForHome = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.service.findForHome();
      res.json(prepareResponse(200, 'Cursos para inicio obtenidos exitosamente', items));
    } catch (err) {
      logger.error('Error in findForHome:', err);
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
  findPublished = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = validatePaginationQuery(req.query);

      if (!validation.isValid) {
        res.status(400).json(
          prepareResponse(400, 'Validation error', {
            errors: validation.errors,
          })
        );
        return;
      }

      const { page, size } = validation.data!;
      const filter: CourseFilterDTO = {};

      const result = await this.service.findPublished(page, size, filter);
      res.json(prepareResponse(200, 'Cursos publicados obtenidos exitosamente', result));
    } catch (err) {
      logger.error('Error in findPublished:', err);
      next(err);
    }
  };

  /**
   * Recupera un curso público por su ID.
   * @param {Request} req - El objeto de solicitud de Express, con parámetro de ruta 'courseId'.
   * @param {Response} res - El objeto de respuesta de Express.
   * @param {NextFunction} next - La función next de Express para manejo de errores.
   * @returns {Promise<void>} Envía una respuesta JSON con el curso o 404 si no se encuentra, o pasa errores a next.
   */
  findOnePublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;

      if (!courseId || typeof courseId !== 'string' || courseId.trim() === '') {
        res.status(400).json(prepareResponse(400, 'ID de curso inválido'));
        return;
      }

      const course = await this.service.findOnePublic(courseId);

      if (!course) {
        res.status(404).json(prepareResponse(404, 'Curso no encontrado'));
        return;
      }

      res.json(prepareResponse(200, 'Curso obtenido exitosamente', course));
    } catch (err) {
      logger.error('Error in findOnePublic:', err);
      next(err);
    }
  };
}
