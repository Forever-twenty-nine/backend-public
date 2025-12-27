/* eslint-env jest */
import { Request, Response, NextFunction } from "express";
import IWantToTrainController from "../iwanttotrain.controller";
import IWantToTrainService from "../../services/iwanttotrain.service";
import IWantToTrainRepository from "../../repositories/iwanttotrain.repository";

jest.mock("../../services/iwanttotrain.service");
jest.mock("../../repositories/iwanttotrain.repository");

const mockService = IWantToTrainService as jest.MockedClass<
  typeof IWantToTrainService
>;
const mockRepository = IWantToTrainRepository as jest.MockedClass<
  typeof IWantToTrainRepository
>;

describe("IWantToTrainController", () => {
  let controller: IWantToTrainController;
  let mockServiceInstance: jest.Mocked<IWantToTrainService>;
  let mockReq: any;
  let mockRes: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    const mockRepoInstance = new mockRepository(
      {} as any,
    ) as jest.Mocked<IWantToTrainRepository>;
    mockServiceInstance = new mockService(
      mockRepoInstance,
    ) as jest.Mocked<IWantToTrainService>;
    controller = new IWantToTrainController(mockServiceInstance);

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

  describe("createIWantToTrain", () => {
    it("should create IWantToTrain successfully", async () => {
      const iWantToTrainData = {
        name: "John Doe",
        company: "ACME",
        email: "john@example.com",
        phonePrefix: "+54",
        phoneNumber: "1122334455",
        message: "I want to train",
      };

      const createdIWantToTrain = { id: "1", ...iWantToTrainData };

      mockReq.body = iWantToTrainData;
      mockServiceInstance.create.mockResolvedValue(createdIWantToTrain as any);

      await controller.createIWantToTrain(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockServiceInstance.create).toHaveBeenCalledWith(iWantToTrainData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 201,
        message: "IWantToTrain creado exitosamente",
        data: createdIWantToTrain,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with error on service failure", async () => {
      const error = new Error("Service error");
      mockServiceInstance.create.mockRejectedValue(error);
      // provide valid body so validation passes and service is called
      mockReq.body = {
        name: "John Doe",
        company: "ACME",
        email: "john@example.com",
        phonePrefix: "+54",
        phoneNumber: "1122334455",
        message: "I want to train",
      };

      await controller.createIWantToTrain(
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
