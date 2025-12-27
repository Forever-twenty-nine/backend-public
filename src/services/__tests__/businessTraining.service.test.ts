/* eslint-env jest */
import BusinessTrainingService from "../businessTraining.service";
import BusinessTrainingRepository from "../../repositories/businessTraining.repository";

jest.mock("../../repositories/businessTraining.repository");

const mockRepository = BusinessTrainingRepository as jest.MockedClass<
  typeof BusinessTrainingRepository
>;

describe("BusinessTrainingService", () => {
  let service: BusinessTrainingService;
  let mockRepoInstance: jest.Mocked<BusinessTrainingRepository>;

  beforeEach(() => {
    mockRepoInstance = new mockRepository(
      {} as any,
    ) as jest.Mocked<BusinessTrainingRepository>;
    service = new BusinessTrainingService(mockRepoInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create BusinessTraining successfully with valid data", async () => {
      const validData = {
        name: "Company Inc",
        email: "contact@company.com",
        phoneNumber: "555123456",
        message: "Need business training",
      } as any;

      const expectedResult = { ...validData, _id: "789" } as any;
      mockRepoInstance.create.mockResolvedValue(expectedResult);

      const result = await service.create(validData);

      expect(mockRepoInstance.create).toHaveBeenCalledWith(validData);
      expect(result).toEqual(expectedResult);
    });
  });
});
