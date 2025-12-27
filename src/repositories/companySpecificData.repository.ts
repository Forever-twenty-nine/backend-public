import { Connection } from "@/models";
import mongoose from "mongoose";
import {
  CompanySpecificDataModel,
  ICompanySpecificData,
} from "@/models/mongo/companySpecificData.model";

class CompanySpecificDataRepository {
  private readonly model: mongoose.Model<
    ICompanySpecificData,
    Record<string, never>,
    Record<string, never>,
    Record<string, never>,
    any,
    any
  >;

  constructor(private readonly connection: Connection) {
    this.model = CompanySpecificDataModel;
  }

  /**
   * Obtiene todos los datos específicos de la compañía
   */
  async getAll(): Promise<ICompanySpecificData[]> {
    const res = await this.model.find({}).exec();
    return res as unknown as ICompanySpecificData[];
  }

  /**
   * Obtiene el primer documento de datos de la compañía (público)
   */
  async getFirst(): Promise<ICompanySpecificData | null> {
    const res = await this.model.findOne({}).exec();
    return res as unknown as ICompanySpecificData | null;
  }
}

export default CompanySpecificDataRepository;
