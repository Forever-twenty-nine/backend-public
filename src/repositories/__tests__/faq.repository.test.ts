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
  
});
