import { IIWantToTrain } from '@/models';
import IWantToTrainRepository from '@/repositories/iwanttotrain.repository';

class IWantToTrainService {
  constructor(private readonly iWantToTrainRepository: IWantToTrainRepository) {}

  /**
   * Creates a new IWantToTrain entry
   * @param iWantToTrainData Data to create
   * @returns Created IWantToTrain
   */
  async create(iWantToTrainData: Omit<IIWantToTrain, '_id'>): Promise<IIWantToTrain> {
    try {
      // Validate required fields
      if (!iWantToTrainData.name || iWantToTrainData.name.trim() === '') {
        throw new Error('Name is required.');
      }
      if (iWantToTrainData.name.length > 100) {
        throw new Error('Name must be less than 100 characters.');
      }

      if (!iWantToTrainData.email || iWantToTrainData.email.trim() === '') {
        throw new Error('Email is required.');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(iWantToTrainData.email)) {
        throw new Error('Invalid email format.');
      }

      if (!iWantToTrainData.phoneNumber || iWantToTrainData.phoneNumber.trim() === '') {
        throw new Error('Phone number is required.');
      }

      return await this.iWantToTrainRepository.create(iWantToTrainData);
    } catch (error) {
      throw new Error(`Error creating IWantToTrain: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default IWantToTrainService;