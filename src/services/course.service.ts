import { ICourse, IPublicCourse } from '@models/courses.model'
import courseRepository from '@repositories/course.repository'

export default class CourseService {
  async findForHome(): Promise<ICourse[]> {
    return courseRepository.findForHome()
  }

  async findPublished(page = 1, size = 20, filter: Record<string, any> = {}): Promise<{ items: ICourse[]; total: number }> {
    return courseRepository.findPublished(page, size, filter)
  }

  async findOnePublic(id: string): Promise<IPublicCourse | null> {
    return courseRepository.findOnePublic(id)
  }
}
