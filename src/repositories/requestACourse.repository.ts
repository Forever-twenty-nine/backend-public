import { Connection } from "@/models";
import { CreateRequestACourseDTO } from "@/dto";
import mongoose from "mongoose";
import {
  IRequestACourse,
  RequestACourseSchema,
} from "@/models/mongo/requestACourse.model";

class RequestACourseRepository {
  private readonly model: mongoose.Model<
    IRequestACourse,
    Record<string, never>,
    Record<string, never>,
    Record<string, never>,
    any,
    any
  >;

  constructor(private readonly connection: Connection) {
    this.model = this.connection.model<IRequestACourse>(
      "RequestACourse",
      RequestACourseSchema,
      "requestacourse",
    );
  }

  /**
   * Creates a new RequestACourse document
   * @param data DTO with fields required to create the document
   * @returns Created document
   */
  async create(data: CreateRequestACourseDTO): Promise<IRequestACourse> {
    const created = await this.model.create(data as Partial<IRequestACourse>);
    return created as unknown as IRequestACourse;
  }
}

export default RequestACourseRepository;
