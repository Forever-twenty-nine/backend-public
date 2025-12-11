import { ICompanySpecificData } from '@/models/mongo/companySpecificData.model';
import CompanySpecificDataRepository from '@/repositories/companySpecificData.repository';

class CompanySpecificDataService {
  constructor(private readonly companySpecificDataRepository: CompanySpecificDataRepository) {}

  /**
   * Obtiene los datos públicos de la compañía (políticas y términos)
   * @returns Datos de la compañía para uso público
   */
  async getPublicCompanyData(): Promise<ICompanySpecificData | null> {
    try {
      return await this.companySpecificDataRepository.getFirst();
    } catch (error) {
      throw new Error(
        `Error al obtener los datos de la compañía: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

export default CompanySpecificDataService;