/* eslint-env jest */
import { Request, Response, NextFunction } from "express";
import BusinessTrainingController from "../businessTraining.controller";
import BusinessTrainingService from "../../services/businessTraining.service";
import BusinessTrainingRepository from "../../repositories/businessTraining.repository";

jest.mock("../../services/businessTraining.service");
jest.mock("../../repositories/businessTraining.repository");

const mockService = BusinessTrainingService as jest.MockedClass<
  typeof BusinessTrainingService
>;
const mockRepository = BusinessTrainingRepository as jest.MockedClass<
  typeof BusinessTrainingRepository
>;

describe("BusinessTrainingController", () => {
  let controller: BusinessTrainingController;
  let mockServiceInstance: jest.Mocked<BusinessTrainingService>;
  let mockReq: any;
  let mockRes: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    const mockRepoInstance = new mockRepository(
      {} as any,
    ) as jest.Mocked<BusinessTrainingRepository>;
    mockServiceInstance = new mockService(
      mockRepoInstance,
    ) as jest.Mocked<BusinessTrainingService>;
    controller = new BusinessTrainingController(mockServiceInstance);

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

  describe("createBusinessTraining", () => {
    it("should create BusinessTraining successfully", async () => {
      const businessTrainingData = {
        name: "Company Inc",
        email: "contact@company.com",
        phoneNumber: "555123456",
        message: "Need business training",
      };

      const createdBusinessTraining = { id: "1", ...businessTrainingData };

      mockReq.body = businessTrainingData;
      mockServiceInstance.create.mockResolvedValue(
        createdBusinessTraining as any,
      );

      await controller.createBusinessTraining(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockServiceInstance.create).toHaveBeenCalledWith(
        businessTrainingData,
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 201,
        message: "BusinessTraining creado exitosamente",
        data: createdBusinessTraining,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with error on service failure", async () => {
      const error = new Error("Service error");
      mockServiceInstance.create.mockRejectedValue(error);
      // provide valid body so validation passes and service is called
      mockReq.body = {
        name: "Company Inc",
        email: "contact@company.com",
        phoneNumber: "555123456",
        message: "Need business training",
      };

      await controller.createBusinessTraining(
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
