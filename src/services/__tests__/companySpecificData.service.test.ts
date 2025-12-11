/* eslint-env jest */
import CompanySpecificDataService from '../companySpecificData.service';
import CompanySpecificDataRepository from '../../repositories/companySpecificData.repository';

describe('CompanySpecificDataService', () => {
  let service: CompanySpecificDataService;
  let mockRepository: jest.Mocked<CompanySpecificDataRepository>;

  beforeEach(() => {
    mockRepository = {
      getAll: jest.fn(),
      getFirst: jest.fn(),
    } as jest.Mocked<CompanySpecificDataRepository>;

    service = new CompanySpecificDataService(mockRepository);
  });

  describe('getPublicCompanyData', () => {
    it('should return company data when repository succeeds', async () => {
      const mockData = {
        _id: 'company-id',
        privacyPolicy: 'Company privacy policy...',
        termsOfService: 'Terms and conditions...',
      } as any;

      mockRepository.getFirst.mockResolvedValue(mockData);

      const result = await service.getPublicCompanyData();

      expect(result).toEqual(mockData);
      expect(mockRepository.getFirst).toHaveBeenCalledTimes(1);
    });

    it('should return null when no company data exists', async () => {
      mockRepository.getFirst.mockResolvedValue(null);

      const result = await service.getPublicCompanyData();

      expect(result).toBeNull();
      expect(mockRepository.getFirst).toHaveBeenCalledTimes(1);
    });

    it('should throw error when repository fails', async () => {
      const errorMessage = 'Database connection failed';
      mockRepository.getFirst.mockRejectedValue(new Error(errorMessage));

      await expect(service.getPublicCompanyData()).rejects.toThrow(
        `Error al obtener los datos de la compañía: ${errorMessage}`
      );

      expect(mockRepository.getFirst).toHaveBeenCalledTimes(1);
    });

    it('should throw error with default message for non-Error objects', async () => {
      mockRepository.getFirst.mockRejectedValue('String error');

      await expect(service.getPublicCompanyData()).rejects.toThrow(
        'Error al obtener los datos de la compañía: String error'
      );
    });
  });
});