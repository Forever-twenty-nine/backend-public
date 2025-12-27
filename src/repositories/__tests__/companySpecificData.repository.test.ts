/* eslint-env jest */
import CompanySpecificDataRepository from "../companySpecificData.repository";
import { CompanySpecificDataModel } from "@/models/mongo/companySpecificData.model";

jest.mock("@/models/mongo/companySpecificData.model");

describe("CompanySpecificDataRepository", () => {
  let repository: CompanySpecificDataRepository;
  let mockConnection: any;

  beforeEach(() => {
    mockConnection = {};
    repository = new CompanySpecificDataRepository(mockConnection);
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return all company specific data", async () => {
      const mockData = [{ key: "value1" }, { key: "value2" }];

      (CompanySpecificDataModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockData),
      });

      const result = await repository.getAll();

      expect(CompanySpecificDataModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockData);
    });
  });

  describe("getFirst", () => {
    it("should return the first company specific data", async () => {
      const mockData = { key: "value" };

      (CompanySpecificDataModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockData),
      });

      const result = await repository.getFirst();

      expect(CompanySpecificDataModel.findOne).toHaveBeenCalledWith({});
      expect(result).toEqual(mockData);
    });

    it("should return null if no data found", async () => {
      (CompanySpecificDataModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.getFirst();

      expect(result).toBeNull();
    });
  });
});
