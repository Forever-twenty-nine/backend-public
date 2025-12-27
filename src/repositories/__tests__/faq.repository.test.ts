/* eslint-env jest */
import FAQRepository from "../faq.repository";

jest.mock("@/models", () => ({
  FAQSchema: {},
  FAQModel: {},
  Types: {
    ObjectId: {
      isValid: jest.fn(
        (id: string) => id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id),
      ),
    },
  },
}));

describe("FAQRepository", () => {
  let repository: FAQRepository;
  let mockConnection: any;
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      find: jest.fn(),
      findById: jest.fn(),
      distinct: jest.fn(),
    };
    mockConnection = {
      model: jest.fn().mockReturnValue(mockModel),
    };
    repository = new FAQRepository(mockConnection);
    jest.clearAllMocks();
  });

  describe("getFAQs", () => {
    it("should return all FAQs without filter", async () => {
      const mockFAQs = [
        { question: "Q1", answer: "A1", category: "general", order: 1 },
        { question: "Q2", answer: "A2", category: "tech", order: 2 },
      ];

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockFAQs),
        }),
      });

      const result = await repository.getFAQs();

      expect(mockModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockFAQs);
    });

    it("should return only active FAQs", async () => {
      const mockFAQs = [{ question: "Q1", isActive: true }];

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockFAQs),
        }),
      });

      const result = await repository.getFAQs(true);

      expect(mockModel.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual(mockFAQs);
    });
  });

  describe("getFAQsByCategory", () => {
    it("should return FAQs by category without active filter", async () => {
      const mockFAQs = [{ question: "Q1", category: "general" }];

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockFAQs),
        }),
      });

      const result = await repository.getFAQsByCategory("general");

      expect(mockModel.find).toHaveBeenCalledWith({ category: "general" });
      expect(result).toEqual(mockFAQs);
    });

    it("should return active FAQs by category", async () => {
      const mockFAQs = [
        { question: "Q1", category: "general", isActive: true },
      ];

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockFAQs),
        }),
      });

      const result = await repository.getFAQsByCategory("general", true);

      expect(mockModel.find).toHaveBeenCalledWith({
        category: "general",
        isActive: true,
      });
      expect(result).toEqual(mockFAQs);
    });
  });

  describe("getFAQById", () => {
    it("should return FAQ by valid id", async () => {
      const mockFAQ = { _id: "507f1f77bcf86cd799439011", question: "Q1" };

      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFAQ),
      });

      const result = await repository.getFAQById("507f1f77bcf86cd799439011");

      expect(mockModel.findById).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011",
      );
      expect(result).toEqual(mockFAQ);
    });

    it("should throw error for invalid id", async () => {
      await expect(repository.getFAQById("invalid")).rejects.toThrow(
        "The provided FAQ ID is not valid.",
      );
    });

    it("should return null if FAQ not found", async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.getFAQById("507f1f77bcf86cd799439011");

      expect(result).toBeNull();
    });
  });

  describe("getCategories", () => {
    it("should return unique categories", async () => {
      const mockCategories = ["general", "tech", null, "support"];

      mockModel.distinct.mockResolvedValue(mockCategories);

      const result = await repository.getCategories();

      expect(mockModel.distinct).toHaveBeenCalledWith("category");
      expect(result).toEqual(["general", "tech", "support"]);
    });
  });
});
