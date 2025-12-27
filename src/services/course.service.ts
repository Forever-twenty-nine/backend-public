import { ICourse, IPublicCourse } from "@models/courses.model";
import courseRepository from "@repositories/course.repository";

export default class CourseService {
  async findForHome(): Promise<ICourse[]> {
    try {
      return await courseRepository.findForHome();
    } catch (error: unknown) {
      if (error instanceof Error) {
        const err = new Error(
          `Error fetching courses for home: ${error.message}`,
        );
        (err as any).cause = error;
        throw err;
      }
      throw new Error(`Error fetching courses for home: ${String(error)}`);
    }
  }

  async findPublished(
    page = 1,
    size = 20,
    filter: Record<string, any> = {},
  ): Promise<{ items: ICourse[]; total: number }> {
    try {
      return await courseRepository.findPublished(page, size, filter);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const err = new Error(
          `Error fetching published courses: ${error.message}`,
        );
        (err as any).cause = error;
        throw err;
      }
      throw new Error(`Error fetching published courses: ${String(error)}`);
    }
  }

  async findOnePublic(id: string): Promise<IPublicCourse | null> {
    try {
      return await courseRepository.findOnePublic(id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const err = new Error(
          `Error fetching public course ${id}: ${error.message}`,
        );
        (err as any).cause = error;
        throw err;
      }
      throw new Error(`Error fetching public course ${id}: ${String(error)}`);
    }
  }
}
