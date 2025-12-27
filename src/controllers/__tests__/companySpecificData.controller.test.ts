/* eslint-env jest */
import { Request, Response, NextFunction } from 'express';
import CompanySpecificDataController from '../companySpecificData.controller';
import CompanySpecificDataService from '../../services/companySpecificData.service';
import CompanySpecificDataRepository from '../../repositories/companySpecificData.repository';

jest.mock('../../services/companySpecificData.service');
jest.mock('../../repositories/companySpecificData.repository');

const mockService = CompanySpecificDataService as jest.MockedClass<typeof CompanySpecificDataService>;
const mockRepository = CompanySpecificDataRepository as jest.MockedClass<typeof CompanySpecificDataRepository>;

describe('CompanySpecificDataController', () => {
  let controller: CompanySpecificDataController;
  let mockServiceInstance: jest.Mocked<CompanySpecificDataService>;
  let mockReq: any;
  let mockRes: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    const mockRepoInstance = new mockRepository() as jest.Mocked<CompanySpecificDataRepository>;
    mockServiceInstance = new mockService(mockRepoInstance) as jest.Mocked<CompanySpecificDataService>;
    controller = new CompanySpecificDataController(mockServiceInstance);

    mockReq = {};

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublicCompanyData', () => {
    it('should return public company data successfully', async () => {
      const data = {
        privacyPolicy: 'Privacy policy text',
        termsOfService: 'Terms of service text',
        otherField: 'ignored',
      };

      const publicData = {
        privacyPolicy: data.privacyPolicy,
        termsOfService: data.termsOfService,
      };

      mockServiceInstance.getPublicCompanyData.mockResolvedValue(data as any);

      await controller.getPublicCompanyData(mockReq as Request, mockRes as Response, mockNext);

      expect(mockServiceInstance.getPublicCompanyData).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        message: 'Datos de la compañía obtenidos correctamente',
        data: publicData,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 if no data found', async () => {
      mockServiceInstance.getPublicCompanyData.mockResolvedValue(null);

      await controller.getPublicCompanyData(mockReq as Request, mockRes as Response, mockNext);

      expect(mockServiceInstance.getPublicCompanyData).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 404,
        message: 'Datos de la compañía no encontrados',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error on service failure', async () => {
      const error = new Error('Service error');
      mockServiceInstance.getPublicCompanyData.mockRejectedValue(error);

      await controller.getPublicCompanyData(mockReq as Request, mockRes as Response, mockNext);

      expect(mockServiceInstance.getPublicCompanyData).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});