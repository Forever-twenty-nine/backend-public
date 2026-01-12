/* eslint-env jest */
import FAQService from "../faq.service";
import FAQRepository from "../../repositories/faq.repository";

jest.mock("../../repositories/faq.repository");

const mockRepository = FAQRepository as jest.MockedClass<typeof FAQRepository>;

describe("FAQService", () => {
  let service: FAQService;
  let mockRepoInstance: jest.Mocked<FAQRepository>;

  beforeEach(() => {
    mockRepoInstance = new mockRepository(
      {} as any,
    ) as jest.Mocked<FAQRepository>;
    service = new FAQService(mockRepoInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllFAQs", () => {
    it("should return all FAQs", async () => {
      const mockFAQs = [
        { _id: "1", question: "What is?", answer: "It is...", isActive: true },
        {
          _id: "2",
          question: "How to?",
          answer: "Like this...",
          isActive: true,
        },
      ] as any;

      mockRepoInstance.getFAQs.mockResolvedValue(mockFAQs);

      const result = await service.getAllFAQs(true);

      expect(mockRepoInstance.getFAQs).toHaveBeenCalledWith(true);
      expect(result).toEqual(mockFAQs);
    });
  });

});
