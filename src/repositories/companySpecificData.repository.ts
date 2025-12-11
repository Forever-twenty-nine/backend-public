import CompanySpecificData, { ICompanySpecificData } from '@/models/mongo/companySpecificData.model';

class CompanySpecificDataRepository {
  /**
   * Obtiene todos los datos específicos de la compañía
   */
  async getAll(): Promise<ICompanySpecificData[]> {
    return CompanySpecificData.find({});
  }

  /**
   * Obtiene el primer documento de datos de la compañía (público)
   */
  async getFirst(): Promise<ICompanySpecificData | null> {
    return CompanySpecificData.findOne({});
  }
}

export default CompanySpecificDataRepository;