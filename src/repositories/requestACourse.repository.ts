import { Connection, Types } from '@/models';
import mongoose from 'mongoose';
import { IRequestACourse, RequestACourseSchema } from '@/models/mongo/requestACourse.model';

class RequestACourseRepository {
  private readonly model: mongoose.Model<any, any, any, any, any, any, any, any>;

  constructor(private readonly connection: Connection) {
    this.model = this.connection.model<IRequestACourse>('RequestACourse', RequestACourseSchema, 'requestacourse');
  }

  async findAll(): Promise<IRequestACourse[]> {
    const res = await this.model.find().exec();
    return res as unknown as IRequestACourse[];
  }

  async findById(id: string): Promise<IRequestACourse | null> {
    const objectId = new Types.ObjectId(id);
    const res = await this.model.findById(objectId).exec();
    return res as unknown as IRequestACourse | null;
  }
}

export default RequestACourseRepository;
