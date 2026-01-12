import { IFAQ } from "@/models";
import FAQRepository from "@/repositories/faq.repository";

class FAQService {
  constructor(private readonly faqRepository: FAQRepository) {}

  /**
   * Devuelves todas las preguntas frecuentes de la base de datos, 
   * @param activeOnly Indica si se deben recuperar solo las preguntas frecuentes activas
   * @returns Array de preguntas frecuentes
   */
  async getAllFAQs(activeOnly: boolean = false): Promise<IFAQ[]> {
    try {
      return await this.faqRepository.getFAQs(activeOnly);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const err = new Error(`Error retrieving FAQs: ${error.message}`);
        (err as any).cause = error;
        throw err;
      }
      throw new Error(`Error retrieving FAQs: ${String(error)}`);
    }
  }

}

export default FAQService;
