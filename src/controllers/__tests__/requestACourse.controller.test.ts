/* eslint-env jest */
import { Request, Response, NextFunction } from "express";
import RequestACourseController from "../requestACourse.controller";
import RequestACourseService from "../../services/requestACourse.service";
import RequestACourseRepository from "../../repositories/requestACourse.repository";

jest.mock("../../services/requestACourse.service");
jest.mock("../../repositories/requestACourse.repository");

const mockService = RequestACourseService as jest.MockedClass<
  typeof RequestACourseService
>;
const mockRepository = RequestACourseRepository as jest.MockedClass<
  typeof RequestACourseRepository
>;

describe("RequestACourseController", () => {
  let controller: RequestACourseController;
  let mockServiceInstance: jest.Mocked<RequestACourseService>;
  let mockReq: any;
  let mockRes: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    const mockRepoInstance = new mockRepository(
      {} as any,
    ) as jest.Mocked<RequestACourseRepository>;
    mockServiceInstance = new mockService(
      mockRepoInstance,
    ) as jest.Mocked<RequestACourseService>;
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

  describe("createRequestACourse", () => {
    it("should create RequestACourse successfully", async () => {
      const requestACourseData = {
        name: "Jane Doe",
        company: "ACME",
        email: "jane@example.com",
        phonePrefix: "+54",
        phoneNumber: "1122334455",
        message: "I want this course",
        course: "Course Name",
      };

      const expectedCreateData = {
        name: requestACourseData.name,
        company: requestACourseData.company,
        email: requestACourseData.email,
        phonePrefix: requestACourseData.phonePrefix,
        phoneNumber: requestACourseData.phoneNumber,
        message: requestACourseData.message,
      };

      const createdRequestACourse = { id: "1", ...requestACourseData };

      mockReq.body = requestACourseData;
      mockServiceInstance.create.mockResolvedValue(
        createdRequestACourse as any,
      );

      await controller.createRequestACourse(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockServiceInstance.create).toHaveBeenCalledWith(
        expectedCreateData,
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 201,
        message: "RequestACourse creado exitosamente",
        data: createdRequestACourse,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with error on service failure", async () => {
      const error = new Error("Service error");
      mockServiceInstance.create.mockRejectedValue(error);

      // provide valid body so validation passes and service is called
      mockReq.body = {
        name: "Jane Doe",
        company: "ACME",
        email: "jane@example.com",
        phonePrefix: "+54",
        phoneNumber: "1122334455",
        message: "I want this course",
      };

      await controller.createRequestACourse(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockServiceInstance.create).toHaveBeenCalledWith(mockReq.body);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});
