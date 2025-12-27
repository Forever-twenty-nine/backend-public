/* eslint-env jest */
import RequestACourseRepository from "../requestACourse.repository";

jest.mock("@/models/mongo/requestACourse.model");

describe("RequestACourseRepository", () => {
  let repository: RequestACourseRepository;
  let mockConnection: any;
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      create: jest.fn(),
    };
    mockConnection = {
      model: jest.fn().mockReturnValue(mockModel),
    };
    repository = new RequestACourseRepository(mockConnection);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new RequestACourse document", async () => {
      const data = {
        name: "Jane",
        company: "XYZ Ltd",
        email: "jane@example.com",
        phonePrefix: "+1",
        phoneNumber: "987654321",
        message: "Request course",
      };
      const mockCreated = { _id: "newId", ...data };

      mockModel.create.mockResolvedValue(mockCreated);

      const result = await repository.create(data);

      expect(mockModel.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(mockCreated);
    });
  });
});
