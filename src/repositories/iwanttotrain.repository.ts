import { Connection, Types } from '@/models';
import mongoose from 'mongoose';
import { IIWantToTrain, IWantToTrainSchema } from '@/models/mongo/iwanttotrain.model';

class IWantToTrainRepository {
  private readonly model: mongoose.Model<any, any, any, any, any, any, any, any>;

  constructor(private readonly connection: Connection) {
    this.model = this.connection.model<IIWantToTrain>('IWantToTrain', IWantToTrainSchema, 'iwanttotrain');
  }

  async findAll(): Promise<IIWantToTrain[]> {
    const res = await this.model.find().exec();
    return res as unknown as IIWantToTrain[];
  }

  async findById(id: string): Promise<IIWantToTrain | null> {
    const objectId = new Types.ObjectId(id);
    const res = await this.model.findById(objectId).exec();
    return res as unknown as IIWantToTrain | null;
  }

}

export default IWantToTrainRepository;
