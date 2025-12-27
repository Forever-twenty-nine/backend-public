/* eslint-env jest */
import { Request, Response, NextFunction } from 'express';
import FAQController from '../faq.controller';
import FAQService from '../../services/faq.service';
import FAQRepository from '../../repositories/faq.repository';

jest.mock('../../services/faq.service');
jest.mock('../../repositories/faq.repository');

const mockService = FAQService as jest.MockedClass<typeof FAQService>;
const mockRepository = FAQRepository as jest.MockedClass<typeof FAQRepository>;

describe('FAQController', () => {
  let controller: FAQController;
  let mockServiceInstance: jest.Mocked<FAQService>;
  let mockReq: any;
  let mockRes: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    const mockRepoInstance = new mockRepository({} as any) as jest.Mocked<FAQRepository>;
    mockServiceInstance = new mockService(mockRepoInstance) as jest.Mocked<FAQService>;
    controller = new FAQController(mockServiceInstance);

    mockReq = {
      query: {},
      params: {},
    };

    mockRes = {
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFAQs', () => {
    it('should return all FAQs successfully', async () => {
      const faqs = [{ id: '1', question: 'Q1' }];
      mockReq.query = { activeOnly: 'true' };
      mockServiceInstance.getAllFAQs.mockResolvedValue(faqs as any);

      await controller.getAllFAQs(mockReq as Request, mockRes as Response, mockNext);

      expect(mockServiceInstance.getAllFAQs).toHaveBeenCalledWith(true);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        message: 'FAQs fetched successfully',
        data: faqs,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error on service failure', async () => {
      const error = new Error('Service error');
      mockServiceInstance.getAllFAQs.mockRejectedValue(error);

      await controller.getAllFAQs(mockReq as Request, mockRes as Response, mockNext);

      expect(mockServiceInstance.getAllFAQs).toHaveBeenCalledWith(false);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('getFAQsByCategory', () => {
    it('should return FAQs by category successfully', async () => {
      const faqs = [{ id: '1', category: 'general' }];
      mockReq.params = { category: 'general' };
      mockReq.query = { activeOnly: 'false' };
      mockServiceInstance.getFAQsByCategory.mockResolvedValue(faqs as any);

      await controller.getFAQsByCategory(mockReq as Request, mockRes as Response, mockNext);

      expect(mockServiceInstance.getFAQsByCategory).toHaveBeenCalledWith('general', false);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        message: 'FAQs fetched successfully',
        data: faqs,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error on service failure', async () => {
      const error = new Error('Service error');
      mockReq.params = { category: 'general' };
      mockServiceInstance.getFAQsByCategory.mockRejectedValue(error);

      await controller.getFAQsByCategory(mockReq as Request, mockRes as Response, mockNext);

      expect(mockServiceInstance.getFAQsByCategory).toHaveBeenCalledWith('general', false);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});