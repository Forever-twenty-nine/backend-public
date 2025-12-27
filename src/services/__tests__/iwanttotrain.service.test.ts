/* eslint-env jest */
import IWantToTrainService from "../iwanttotrain.service";
import IWantToTrainRepository from "../../repositories/iwanttotrain.repository";

jest.mock("../../repositories/iwanttotrain.repository");

const mockRepository = IWantToTrainRepository as jest.MockedClass<
  typeof IWantToTrainRepository
>;

describe("IWantToTrainService", () => {
  let service: IWantToTrainService;
  let mockRepoInstance: jest.Mocked<IWantToTrainRepository>;

  beforeEach(() => {
    mockRepoInstance = new mockRepository(
      {} as any,
    ) as jest.Mocked<IWantToTrainRepository>;
    service = new IWantToTrainService(mockRepoInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create IWantToTrain successfully with valid data", async () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        phoneNumber: "123456789",
        message: "Interested in training",
      } as any;

      const expectedResult = { ...validData, _id: "123" } as any;
      mockRepoInstance.create.mockResolvedValue(expectedResult);

      const result = await service.create(validData);

      expect(mockRepoInstance.create).toHaveBeenCalledWith(validData);
      expect(result).toEqual(expectedResult);
    });
  });
});
