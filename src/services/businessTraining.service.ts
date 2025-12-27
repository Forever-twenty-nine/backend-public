import { IBusinessTraining } from '@/models';
import BusinessTrainingRepository from '@/repositories/businessTraining.repository';
import { CreateBusinessTrainingDTO } from '@/dto';

class BusinessTrainingService {
  constructor(private readonly businessTrainingRepository: BusinessTrainingRepository) {}

  /**
   * Creates a new BusinessTraining entry
   * @param businessTrainingData Data to create
   * @returns Created BusinessTraining
   */
  async create(businessTrainingData: CreateBusinessTrainingDTO): Promise<IBusinessTraining> {
    try {
      return await this.businessTrainingRepository.create(businessTrainingData);
    } catch (error) {
      throw new Error(`Error creating BusinessTraining: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default BusinessTrainingService;