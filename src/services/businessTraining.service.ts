import { IBusinessTraining } from '@/models';
import BusinessTrainingRepository from '@/repositories/businessTraining.repository';

class BusinessTrainingService {
  constructor(private readonly businessTrainingRepository: BusinessTrainingRepository) {}

  /**
   * Creates a new BusinessTraining entry
   * @param businessTrainingData Data to create
   * @returns Created BusinessTraining
   */
  async create(businessTrainingData: Omit<IBusinessTraining, '_id'>): Promise<IBusinessTraining> {
    try {
      // Validate required fields
      if (!businessTrainingData.name || businessTrainingData.name.trim() === '') {
        throw new Error('Name is required.');
      }
      if (businessTrainingData.name.length > 100) {
        throw new Error('Name must be less than 100 characters.');
      }

      if (!businessTrainingData.email || businessTrainingData.email.trim() === '') {
        throw new Error('Email is required.');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(businessTrainingData.email)) {
        throw new Error('Invalid email format.');
      }

      if (!businessTrainingData.phoneNumber || businessTrainingData.phoneNumber.trim() === '') {
        throw new Error('Phone number is required.');
      }

      if (!businessTrainingData.message || businessTrainingData.message.trim() === '') {
        throw new Error('Message is required.');
      }
      if (businessTrainingData.message.length > 1000) {
        throw new Error('Message must be less than 1000 characters.');
      }

      return await this.businessTrainingRepository.create(businessTrainingData);
    } catch (error) {
      throw new Error(`Error creating BusinessTraining: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default BusinessTrainingService;