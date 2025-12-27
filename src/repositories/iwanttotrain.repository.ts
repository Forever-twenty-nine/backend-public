import { Connection } from "@/models";
import { CreateIWantToTrainDTO } from "@/dto";
import mongoose from "mongoose";
import {
  IIWantToTrain,
  IWantToTrainSchema,
} from "@/models/mongo/iwanttotrain.model";

class IWantToTrainRepository {
  private readonly model: mongoose.Model<
    IIWantToTrain,
    Record<string, never>,
    Record<string, never>,
    Record<string, never>,
    any,
    any
  >;

  constructor(private readonly connection: Connection) {
    this.model = this.connection.model<IIWantToTrain>(
      "IWantToTrain",
      IWantToTrainSchema,
      "iwanttotrain",
    );
  }

  /**
   * Creates a new IWantToTrain document
   * @param data DTO with fields required to create the document
   * @returns Created document
   */
  async create(data: CreateIWantToTrainDTO): Promise<IIWantToTrain> {
    const created = await this.model.create(data as Partial<IIWantToTrain>);
    return created as unknown as IIWantToTrain;
  }
}

export default IWantToTrainRepository;
