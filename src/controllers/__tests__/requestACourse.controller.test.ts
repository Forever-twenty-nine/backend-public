/* eslint-env jest */
import { Request, Response, NextFunction } from 'express';
import RequestACourseController from '../requestACourse.controller';
import RequestACourseService from '../../services/requestACourse.service';
import RequestACourseRepository from '../../repositories/requestACourse.repository';

jest.mock('../../services/requestACourse.service');
jest.mock('../../repositories/requestACourse.repository');

const mockService = RequestACourseService as jest.MockedClass<typeof RequestACourseService>;
const mockRepository = RequestACourseRepository as jest.MockedClass<typeof RequestACourseRepository>;

describe('RequestACourseController', () => {
  let controller: RequestACourseController;
  let mockServiceInstance: jest.Mocked<RequestACourseService>;
  let mockReq: any;
  let mockRes: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    const mockRepoInstance = new mockRepository({} as any) as jest.Mocked<RequestACourseRepository>;
    mockServiceInstance = new mockService(mockRepoInstance) as jest.Mocked<RequestACourseService>;
    controller = new RequestACourseController(mockServiceInstance);

    mockReq = {
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRequestACourse', () => {
    it('should create RequestACourse successfully', async () => {
      const requestACourseData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        course: 'Course Name',
      };

      const createdRequestACourse = { id: '1', ...requestACourseData };

      mockReq.body = requestACourseData;
      mockServiceInstance.create.mockResolvedValue(createdRequestACourse as any);

      await controller.createRequestACourse(mockReq as Request, mockRes as Response, mockNext);

      expect(mockServiceInstance.create).toHaveBeenCalledWith(requestACourseData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 201,
        message: 'RequestACourse created successfully',
        data: createdRequestACourse,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error on service failure', async () => {
      const error = new Error('Service error');
      mockServiceInstance.create.mockRejectedValue(error);

      await controller.createRequestACourse(mockReq as Request, mockRes as Response, mockNext);

      expect(mockServiceInstance.create).toHaveBeenCalledWith(mockReq.body);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});