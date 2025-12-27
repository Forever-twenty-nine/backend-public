/* eslint-env jest */
import IWantToTrainRepository from "../iwanttotrain.repository";

jest.mock("@/models/mongo/iwanttotrain.model");

describe("IWantToTrainRepository", () => {
  let repository: IWantToTrainRepository;
  let mockConnection: any;
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      create: jest.fn(),
    };
    mockConnection = {
      model: jest.fn().mockReturnValue(mockModel),
    };
    repository = new IWantToTrainRepository(mockConnection);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new IWantToTrain document", async () => {
      const data = {
        name: "John",
        company: "ABC Corp",
        email: "john@example.com",
        phonePrefix: "+1",
        phoneNumber: "123456789",
        message: "I want to train",
      };
      const mockCreated = { _id: "newId", ...data };

      mockModel.create.mockResolvedValue(mockCreated);

      const result = await repository.create(data);

      expect(mockModel.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(mockCreated);
    });
  });
});
