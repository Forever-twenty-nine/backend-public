/* eslint-env jest */
import RequestACourseService from '../requestACourse.service';
import RequestACourseRepository from '../../repositories/requestACourse.repository';

jest.mock('../../repositories/requestACourse.repository');

const mockRepository = RequestACourseRepository as jest.MockedClass<typeof RequestACourseRepository>;

describe('RequestACourseService', () => {
  let service: RequestACourseService;
  let mockRepoInstance: jest.Mocked<RequestACourseRepository>;

  beforeEach(() => {
    mockRepoInstance = new mockRepository({} as any) as jest.Mocked<RequestACourseRepository>;
    service = new RequestACourseService(mockRepoInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create RequestACourse successfully with valid data', async () => {
      const validData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '987654321',
        message: 'Requesting a course'
      } as any;

      const expectedResult = { ...validData, _id: '456' } as any;
      mockRepoInstance.create.mockResolvedValue(expectedResult);

      const result = await service.create(validData);

      expect(mockRepoInstance.create).toHaveBeenCalledWith(validData);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error for missing name', async () => {
      const invalidData = {
        name: '',
        email: 'jane@example.com',
        phoneNumber: '987654321'
      } as any;

      await expect(service.create(invalidData)).rejects.toThrow('Name is required.');
    });

    it('should throw error for invalid email', async () => {
      const invalidData = {
        name: 'Jane Doe',
        email: 'invalid-email',
        phoneNumber: '987654321'
      } as any;

      await expect(service.create(invalidData)).rejects.toThrow('Invalid email format.');
    });
  });
});