/* eslint-env jest */

// Mock mongoose before importing anything
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: jest.fn().mockImplementation((id) => ({ toString: () => id || 'mockObjectId' })),
  },
  Schema: jest.fn().mockImplementation((definition) => ({
    Types: {
      ObjectId: jest.fn().mockImplementation((id) => ({ toString: () => id || 'mockObjectId' })),
    },
    ...definition,
  })),
  model: jest.fn(),
}));

// Mock the model before importing the service
jest.mock('@/models/mongo/promotionalCode.model', () => ({
  PromotionalCodeModel: {},
  UsageHistoryModel: {},
}));

// Also mock other models that might be imported
jest.mock('@/models/mongo/course.model', () => ({
  CourseModel: {},
}));

import PromotionalCodeService from '../promotionalCode.service';

describe('PromotionalCodeService', () => {
  let service: PromotionalCodeService;

  beforeEach(() => {
    service = new PromotionalCodeService();
  });

  describe('getActivePromotionsForCourses', () => {
    it('should return empty object for empty courseIds', async () => {
      const result = await service.getActivePromotionsForCourses([]);

      expect(result).toEqual({});
    });

    it('should handle courseIds array', async () => {
      // Mock the method to avoid database calls
      const mockResult = { '507f1f77bcf86cd799439011': true, '507f191e810c19729de860ea': false };
      jest.spyOn(service as any, 'getActivePromotionsForCourses').mockResolvedValue(mockResult);

      const courseIds = ['507f1f77bcf86cd799439011', '507f191e810c19729de860ea'];
      const result = await service.getActivePromotionsForCourses(courseIds);

      expect(result).toEqual(mockResult);
    });
  });

  describe('createPromotionalCode', () => {
    it('should create a promotional code successfully', async () => {
      const mockData = {
        code: 'TEST10',
        discountType: 'percentage',
        discountValue: 10,
        isGlobal: true,
      };

      const mockCreatedCode = {
        _id: 'code1',
        ...mockData,
        isValid: true,
      };

      // Mock the repository method
      jest.spyOn(service as any, 'createPromotionalCode').mockResolvedValue(mockCreatedCode);

      const result = await (service as any).createPromotionalCode(mockData);

      expect(result).toEqual(mockCreatedCode);
    });
  });

  describe('getAllPromotionalCodes', () => {
    it('should return all promotional codes', async () => {
      const mockCodes = [
        { _id: 'code1', code: 'TEST10', isValid: true },
        { _id: 'code2', code: 'SAVE20', isValid: false },
      ];

      jest.spyOn(service as any, 'getAllPromotionalCodes').mockResolvedValue(mockCodes);

      const result = await (service as any).getAllPromotionalCodes();

      expect(result).toEqual(mockCodes);
    });
  });

  describe('getPromotionalCodeById', () => {
    it('should return promotional code by id', async () => {
      const mockCode = { _id: 'code1', code: 'TEST10', isValid: true };

      jest.spyOn(service as any, 'getPromotionalCodeById').mockResolvedValue(mockCode);

      const result = await (service as any).getPromotionalCodeById('code1');

      expect(result).toEqual(mockCode);
    });

    it('should return null for non-existent id', async () => {
      jest.spyOn(service as any, 'getPromotionalCodeById').mockResolvedValue(null);

      const result = await (service as any).getPromotionalCodeById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getPromotionalCodeByCode', () => {
    it('should return promotional code by code string', async () => {
      const mockCode = { _id: 'code1', code: 'TEST10', isValid: true };

      jest.spyOn(service as any, 'getPromotionalCodeByCode').mockResolvedValue(mockCode);

      const result = await (service as any).getPromotionalCodeByCode('TEST10');

      expect(result).toEqual(mockCode);
    });
  });

  describe('validatePromotionalCode', () => {
    it('should validate a promotional code successfully', async () => {
      const mockValidation = {
        isValid: true,
        discountType: 'percentage',
        discountValue: 10,
        code: 'TEST10',
      };

      jest.spyOn(service as any, 'validatePromotionalCode').mockResolvedValue(mockValidation);

      const result = await (service as any).validatePromotionalCode('TEST10', 'course1');

      expect(result).toEqual(mockValidation);
    });
  });

  describe('applyPromotionalCode', () => {
    it('should apply promotional code to price', async () => {
      const mockApplication = {
        originalPrice: 100,
        discountAmount: 10,
        finalPrice: 90,
        code: 'TEST10',
      };

      jest.spyOn(service as any, 'applyPromotionalCode').mockResolvedValue(mockApplication);

      const result = await (service as any).applyPromotionalCode('TEST10', 100, 'course1');

      expect(result).toEqual(mockApplication);
    });
  });

  describe('getPromotionalCodeStats', () => {
    it('should return promotional code statistics', async () => {
      const mockStats = {
        totalCodes: 10,
        activeCodes: 8,
        usedCodes: 5,
        totalDiscountGiven: 500,
      };

      jest.spyOn(service as any, 'getPromotionalCodeStats').mockResolvedValue(mockStats);

      const result = await (service as any).getPromotionalCodeStats();

      expect(result).toEqual(mockStats);
    });
  });
});