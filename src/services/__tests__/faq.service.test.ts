/* eslint-env jest */
import FAQService from '../faq.service';
import FAQRepository from '../../repositories/faq.repository';

jest.mock('../../repositories/faq.repository');

const mockRepository = FAQRepository as jest.MockedClass<typeof FAQRepository>;

describe('FAQService', () => {
  let service: FAQService;
  let mockRepoInstance: jest.Mocked<FAQRepository>;

  beforeEach(() => {
    mockRepoInstance = new mockRepository({} as any) as jest.Mocked<FAQRepository>;
    service = new FAQService(mockRepoInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFAQs', () => {
    it('should return all FAQs', async () => {
      const mockFAQs = [
        { _id: '1', question: 'What is?', answer: 'It is...', isActive: true },
        { _id: '2', question: 'How to?', answer: 'Like this...', isActive: true }
      ] as any;

      mockRepoInstance.getFAQs.mockResolvedValue(mockFAQs);

      const result = await service.getAllFAQs(true);

      expect(mockRepoInstance.getFAQs).toHaveBeenCalledWith(true);
      expect(result).toEqual(mockFAQs);
    });
  });

  describe('getFAQsByCategory', () => {
    it('should return FAQs by category', async () => {
      const mockFAQs = [{ _id: '1', question: 'Q', answer: 'A', category: 'general' }] as any;

      mockRepoInstance.getFAQsByCategory.mockResolvedValue(mockFAQs);

      const result = await service.getFAQsByCategory('general', true);

      expect(mockRepoInstance.getFAQsByCategory).toHaveBeenCalledWith('general', true);
      expect(result).toEqual(mockFAQs);
    });

    it('should throw error for empty category', async () => {
      await expect(service.getFAQsByCategory('', true)).rejects.toThrow('Category is required.');
    });
  });

  describe('createFAQ', () => {
    it('should create a new FAQ', async () => {
      const faqData = {
        question: 'What is Node.js?',
        answer: 'Node.js is a JavaScript runtime.',
        category: 'technical',
        isActive: true,
        order: 1,
      } as any;

      const createdFAQ = { _id: 'new-id', ...faqData } as any;

      mockRepoInstance.createFAQ.mockResolvedValue(createdFAQ);

      const result = await service.createFAQ(faqData);

      expect(mockRepoInstance.createFAQ).toHaveBeenCalledWith(faqData);
      expect(result).toEqual(createdFAQ);
    });

    it('should throw error for invalid FAQ data', async () => {
      const invalidData = { question: '', answer: 'Answer' } as any;

      mockRepoInstance.createFAQ.mockRejectedValue(new Error('Question is required.'));

      await expect(service.createFAQ(invalidData)).rejects.toThrow('Error creating FAQ: Question is required.');
    });
  });

  describe('updateFAQ', () => {
    it('should update an existing FAQ', async () => {
      const updateData = { answer: 'Updated answer', isActive: false };
      const updatedFAQ = {
        _id: 'faq-id',
        question: 'Original question',
        answer: 'Updated answer',
        isActive: false,
      } as any;

      mockRepoInstance.updateFAQ.mockResolvedValue(updatedFAQ);

      const result = await service.updateFAQ('faq-id', updateData);

      expect(mockRepoInstance.updateFAQ).toHaveBeenCalledWith('faq-id', updateData);
      expect(result).toEqual(updatedFAQ);
    });

    it('should throw error for non-existent FAQ', async () => {
      mockRepoInstance.updateFAQ.mockRejectedValue(new Error('FAQ not found'));

      await expect(service.updateFAQ('non-existent', { answer: 'New answer' })).rejects.toThrow('FAQ not found');
    });
  });

  describe('deleteFAQ', () => {
    it('should delete an FAQ', async () => {
      const deletedFAQ = {
        _id: 'faq-id',
        question: 'Question to delete',
        answer: 'Answer to delete',
      } as any;

      mockRepoInstance.deleteFAQ.mockResolvedValue(deletedFAQ);

      const result = await service.deleteFAQ('faq-id');

      expect(mockRepoInstance.deleteFAQ).toHaveBeenCalledWith('faq-id');
      expect(result).toEqual(deletedFAQ);
    });

    it('should throw error when FAQ not found', async () => {
      mockRepoInstance.deleteFAQ.mockRejectedValue(new Error('FAQ not found'));

      await expect(service.deleteFAQ('non-existent')).rejects.toThrow('FAQ not found');
    });
  });

  describe('getCategories', () => {
    it('should return list of categories', async () => {
      const categories = ['general', 'technical', 'billing'];

      mockRepoInstance.getCategories.mockResolvedValue(categories);

      const result = await service.getCategories();

      expect(mockRepoInstance.getCategories).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });

    it('should return empty array when no categories', async () => {
      mockRepoInstance.getCategories.mockResolvedValue([]);

      const result = await service.getCategories();

      expect(result).toEqual([]);
    });
  });

  describe('updateFAQOrder', () => {
    it('should update FAQ order successfully', async () => {
      const orderUpdates = [
        { id: 'faq1', order: 1 },
        { id: 'faq2', order: 2 },
      ];

      mockRepoInstance.updateFAQOrder.mockResolvedValue(2);

      const result = await service.updateFAQOrder(orderUpdates);

      expect(mockRepoInstance.updateFAQOrder).toHaveBeenCalledWith(orderUpdates);
      expect(result).toEqual({ updatedCount: 2 });
    });

    it('should handle empty order updates', async () => {
      mockRepoInstance.updateFAQOrder.mockRejectedValue(new Error('Order updates array is required and cannot be empty.'));

      await expect(service.updateFAQOrder([])).rejects.toThrow('Order updates array is required and cannot be empty.');
    });
  });
});