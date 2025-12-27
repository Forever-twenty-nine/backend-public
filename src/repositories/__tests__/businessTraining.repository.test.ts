/* eslint-env jest */
import BusinessTrainingRepository from "../businessTraining.repository";

jest.mock("@/models", () => ({
  BusinessTrainingSchema: {},
  Types: {
    ObjectId: jest.fn((id: string) => ({ toString: () => id })),
  },
}));

describe("BusinessTrainingRepository", () => {
  let repository: BusinessTrainingRepository;
  let mockConnection: any;
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };
    mockConnection = {
      model: jest.fn().mockReturnValue(mockModel),
    };
    repository = new BusinessTrainingRepository(mockConnection);
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all business trainings", async () => {
      const mockTrainings = [
        { name: "Training 1", description: "Desc 1" },
        { name: "Training 2", description: "Desc 2" },
      ];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTrainings),
      });

      const result = await repository.findAll();

      expect(mockModel.find).toHaveBeenCalledWith();
      expect(result).toEqual(mockTrainings);
    });
  });

  describe("findById", () => {
    it("should return business training by id", async () => {
      const mockTraining = {
        _id: "507f1f77bcf86cd799439011",
        name: "Training 1",
      };

      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTraining),
      });

      const result = await repository.findById("507f1f77bcf86cd799439011");

      expect(mockModel.findById).toHaveBeenCalledWith({
        toString: expect.any(Function),
      });
      expect(result).toEqual(mockTraining);
    });

    it("should return null if not found", async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findById("507f1f77bcf86cd799439011");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a new business training", async () => {
      const data = { name: "New Training", description: "New Desc" };
      const mockCreated = { _id: "newId", ...data };

      mockModel.create.mockResolvedValue(mockCreated);

      const result = await repository.create(data);

      expect(mockModel.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(mockCreated);
    });
  });

  describe("updateById", () => {
    it("should update business training by id", async () => {
      const data = { name: "Updated Training" };
      const mockUpdated = { _id: "507f1f77bcf86cd799439011", ...data };

      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdated),
      });

      const result = await repository.updateById(
        "507f1f77bcf86cd799439011",
        data,
      );

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { toString: expect.any(Function) },
        data,
        { new: true },
      );
      expect(result).toEqual(mockUpdated);
    });

    it("should return null if not found", async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.updateById(
        "507f1f77bcf86cd799439011",
        {},
      );

      expect(result).toBeNull();
    });
  });

  describe("deleteById", () => {
    it("should delete business training by id", async () => {
      const mockDeleted = {
        _id: "507f1f77bcf86cd799439011",
        name: "Deleted Training",
      };

      mockModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDeleted),
      });

      const result = await repository.deleteById("507f1f77bcf86cd799439011");

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith({
        toString: expect.any(Function),
      });
      expect(result).toEqual(mockDeleted);
    });

    it("should return null if not found", async () => {
      mockModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.deleteById("507f1f77bcf86cd799439011");

      expect(result).toBeNull();
    });
  });
});
