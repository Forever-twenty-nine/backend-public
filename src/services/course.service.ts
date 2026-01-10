import { ICourse, IPublicCourse } from "@models/courses.model";
import courseRepository from "@repositories/course.repository";

export default class CourseService {
  async findForHome(): Promise<ICourse[]> {
    try {
      const items = await courseRepository.findForHome();
      return items;
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
      const result = await courseRepository.findPublished(page, size, filter);
      return result;
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
      const item = await courseRepository.findOnePublic(id);
      return item;
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
