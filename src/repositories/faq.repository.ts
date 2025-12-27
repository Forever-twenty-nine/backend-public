import { FAQSchema, IFAQ, FAQModel, Connection, Types } from '@/models';
import mongoose from 'mongoose';

class FAQRepository {
  private readonly model: mongoose.Model<FAQModel, {}, {}, {}, any, any>;

  constructor(private readonly connection: Connection) {
    this.model = this.connection.model<FAQModel>('FAQ', FAQSchema, 'faqs');
  }

  /**
   * Retrieves all FAQs from the database, sorted by category and order
   * @param activeOnly Whether to retrieve only active FAQs
   * @returns Array of FAQs
   */
  async getFAQs(activeOnly: boolean = false): Promise<IFAQ[]> {
    const filter = activeOnly ? { isActive: true } : {};
    const res = await this.model.find(filter).sort({ category: 1, order: 1 }).exec();
    return res as unknown as IFAQ[];
  }

  /**
   * Retrieves FAQs by category
   * @param category FAQ category
   * @param activeOnly Whether to retrieve only active FAQs
   * @returns Array of FAQs in the specified category
   */
  async getFAQsByCategory(category: string, activeOnly: boolean = false): Promise<IFAQ[]> {
    const filter: Record<string, unknown> = { category };
    if (activeOnly) {
      filter.isActive = true;
    }
    const res = await this.model.find(filter).sort({ order: 1 }).exec();
    return res as unknown as IFAQ[];
  }

  /**
   * Retrieves a single FAQ by ID
   * @param id FAQ ID
   * @returns FAQ object or null if not found
   */
  async getFAQById(id: string): Promise<IFAQ | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('The provided FAQ ID is not valid.');
    }
    const res = await this.model.findById(id).exec();
    return res as unknown as IFAQ | null;
  }


  /**
   * Gets all unique categories
   * @returns Array of unique category names
   */
  async getCategories(): Promise<string[]> {
    const categories = await this.model.distinct('category');
    return categories.filter(Boolean); // Remove null/undefined values
  }

}

export default FAQRepository;
