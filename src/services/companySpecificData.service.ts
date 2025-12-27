import { ICompanySpecificData } from "@/models/mongo/companySpecificData.model";
import CompanySpecificDataRepository from "@/repositories/companySpecificData.repository";

class CompanySpecificDataService {
  constructor(
    private readonly companySpecificDataRepository: CompanySpecificDataRepository,
  ) {}

  /**
   * Obtiene los datos públicos de la compañía (políticas y términos)
   * @returns Datos de la compañía para uso público
   */
  async getPublicCompanyData(): Promise<ICompanySpecificData | null> {
    try {
      return await this.companySpecificDataRepository.getFirst();
    } catch (error: unknown) {
      if (error instanceof Error) {
        const err = new Error(
          `Error al obtener los datos de la compañía: ${error.message}`,
        );
        (err as any).cause = error;
        throw err;
      }
      throw new Error(
        `Error al obtener los datos de la compañía: ${String(error)}`,
      );
    }
  }
}

export default CompanySpecificDataService;
