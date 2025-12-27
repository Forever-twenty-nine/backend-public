import { IIWantToTrain } from '@/models';
import IWantToTrainRepository from '@/repositories/iwanttotrain.repository';
import { CreateIWantToTrainDTO } from '@/dto';

class IWantToTrainService {
  constructor(private readonly iWantToTrainRepository: IWantToTrainRepository) {}

  /**
   * Creates a new IWantToTrain entry
   * @param iWantToTrainData Data to create
   * @returns Created IWantToTrain
   */
  async create(iWantToTrainData: CreateIWantToTrainDTO): Promise<IIWantToTrain> {
    try {
      return await this.iWantToTrainRepository.create(iWantToTrainData);
    } catch (error) {
      throw new Error(`Error creating IWantToTrain: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default IWantToTrainService;