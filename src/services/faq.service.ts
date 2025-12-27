import { IFAQ } from "@/models";
import FAQRepository from "@/repositories/faq.repository";

class FAQService {
  constructor(private readonly faqRepository: FAQRepository) {}

  /**
   * Retrieves all FAQs
   * @param activeOnly Whether to retrieve only active FAQs
   * @returns Array of FAQs
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

  /**
   * Retrieves FAQs by category
   * @param category FAQ category
   * @param activeOnly Whether to retrieve only active FAQs
   * @returns Array of FAQs in the specified category
   */
  async getFAQsByCategory(
    category: string,
    activeOnly: boolean = false,
  ): Promise<IFAQ[]> {
    try {
      if (!category || category.trim() === "") {
        throw new Error("Category is required.");
      }
      return await this.faqRepository.getFAQsByCategory(
        category.trim(),
        activeOnly,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        const err = new Error(
          `Error retrieving FAQs by category: ${error.message}`,
        );
        (err as any).cause = error;
        throw err;
      }
      throw new Error(`Error retrieving FAQs by category: ${String(error)}`);
    }
  }

  /**
   * Gets all unique categories
   * @returns Array of unique category names
   */
  async getCategories(): Promise<string[]> {
    try {
      return await this.faqRepository.getCategories();
    } catch (error: unknown) {
      if (error instanceof Error) {
        const err = new Error(`Error retrieving categories: ${error.message}`);
        (err as any).cause = error;
        throw err;
      }
      throw new Error(`Error retrieving categories: ${String(error)}`);
    }
  }
}

export default FAQService;
