import { IIWantToTrain } from '@/models';
import RequestACourseRepository from '@/repositories/requestACourse.repository';
import { CreateRequestACourseDTO } from '@/dto';

class RequestACourseService {
  constructor(private readonly requestACourseRepository: RequestACourseRepository) {}

  /**
   * Creates a new RequestACourse entry
   * @param requestACourseData Data to create
   * @returns Created RequestACourse
   */
  async create(requestACourseData: CreateRequestACourseDTO): Promise<IIWantToTrain> {
    try {
      return await this.requestACourseRepository.create(requestACourseData);
    } catch (error) {
      throw new Error(`Error creating RequestACourse: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default RequestACourseService;