import { IIWantToTrain } from '@/models';
import RequestACourseRepository from '@/repositories/requestACourse.repository';

class RequestACourseService {
  constructor(private readonly requestACourseRepository: RequestACourseRepository) {}

  /**
   * Creates a new RequestACourse entry
   * @param requestACourseData Data to create
   * @returns Created RequestACourse
   */
  async create(requestACourseData: Omit<IIWantToTrain, '_id'>): Promise<IIWantToTrain> {
    try {
      // Validate required fields
      if (!requestACourseData.name || requestACourseData.name.trim() === '') {
        throw new Error('Name is required.');
      }
      if (requestACourseData.name.length > 100) {
        throw new Error('Name must be less than 100 characters.');
      }

      if (!requestACourseData.email || requestACourseData.email.trim() === '') {
        throw new Error('Email is required.');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(requestACourseData.email)) {
        throw new Error('Invalid email format.');
      }

      if (!requestACourseData.phoneNumber || requestACourseData.phoneNumber.trim() === '') {
        throw new Error('Phone number is required.');
      }

      return await this.requestACourseRepository.create(requestACourseData);
    } catch (error) {
      throw new Error(`Error creating RequestACourse: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default RequestACourseService;