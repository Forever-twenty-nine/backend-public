import { ICourse, IPublicCourse } from "@models/courses.model";
import courseRepository from "@repositories/course.repository";

export default class CourseService {

  /**
   * Devuelve los cursos para la página principal.
   * @returns Lista de cursos para la página de inicio.
   */
  async findForHome(): Promise<ICourse[]> {
    try {
      const items = await courseRepository.findForHome();
      return items;
    } catch (error: unknown) {
      if (error instanceof Error) {
        const err = new Error(
          `Error buscando cursos para la página principal: ${error.message}`,
        );
        (err as any).cause = error;
        throw err;
      }
      throw new Error(`Error buscando cursos para la página principal: ${String(error)}`);
    }
  }

  /**
   * Devuelve los cursos publicados con paginación y filtros.
   * @param page Número de página.
   * @param size Tamaño de página.
   * @param filter Filtros adicionales.
   * @returns Objeto con items y total de cursos publicados.
   */
  async findPublished(
    page = 1,
    size = 20,
    filter: Record<string, any> = {},
  ): Promise<{ items: ICourse[]; total: number }> {
    try {
      const result = await courseRepository.findPublished(page, size, filter);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        const err = new Error(
          `Error buscando cursos publicados: ${error.message}`,
        );
        (err as any).cause = error;
        throw err;
      }
      throw new Error(`Error buscando cursos publicados: ${String(error)}`);
    }
  }

  /**
   * Devuelve un curso público por su ID.
   * @param id ID del curso.
   * @returns Curso público o null si no se encuentra.
   */
  async findOnePublic(id: string): Promise<IPublicCourse | null> {
    try {
      const item = await courseRepository.findOnePublic(id);
      return item;
    } catch (error: unknown) {
      if (error instanceof Error) {
        const err = new Error(
          `Error buscando curso público ${id}: ${error.message}`,
        );
        (err as any).cause = error;
        throw err;
      }
      throw new Error(`Error buscando curso público ${id}: ${String(error)}`);
    }
  }
}
