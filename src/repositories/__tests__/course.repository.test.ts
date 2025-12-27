/* eslint-env jest */
import CourseRepository from "../course.repository";
import { Course } from "@models/mongo/course.model";

jest.mock("@models/mongo/course.model");

const mockCourse = Course as jest.Mocked<typeof Course>;

describe("CourseRepository", () => {
  let repository: typeof CourseRepository;

  beforeEach(() => {
    repository = CourseRepository;
    jest.clearAllMocks();
  });

  describe("findForHome", () => {
    it("should return courses for home with default limit", async () => {
      const mockDocs = [
        { name: "Course 1", imageUrl: "url1", description: "desc1" },
        { name: "Course 2", imageUrl: "url2", description: "desc2" },
      ];

      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDocs),
      };

      mockCourse.find.mockReturnValue(mockQuery as any);

      const result = await repository.findForHome();

      expect(mockCourse.find).toHaveBeenCalledWith({
        isPublished: true,
        showOnHome: true,
      });
      expect(mockQuery.sort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(mockQuery.limit).toHaveBeenCalledWith(12);
      expect(result).toHaveLength(2);
    });

    it("should return courses for home with custom limit", async () => {
      const mockDocs = [{ name: "Course 1" }];

      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDocs),
      };

      mockCourse.find.mockReturnValue(mockQuery as any);

      const result = await repository.findForHome(5);

      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
    });
  });

  describe("findPublished", () => {
    it("should return paginated published courses", async () => {
      const mockDocs = [{ name: "Course 1" }];
      const mockTotal = 10;

      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDocs),
      };

      mockCourse.find.mockReturnValue(mockQuery as any);
      mockCourse.countDocuments.mockResolvedValue(mockTotal);

      const result = await repository.findPublished(1, 5);

      expect(mockCourse.find).toHaveBeenCalledWith({ isPublished: true });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(mockCourse.countDocuments).toHaveBeenCalledWith({
        isPublished: true,
      });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(mockTotal);
    });

    it("should apply additional filters", async () => {
      const filter = { category: "tech" };
      const mockDocs: any[] = [];
      const mockTotal = 0;

      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDocs),
      };

      mockCourse.find.mockReturnValue(mockQuery as any);
      mockCourse.countDocuments.mockResolvedValue(mockTotal);

      await repository.findPublished(1, 20, filter);

      expect(mockCourse.find).toHaveBeenCalledWith({
        isPublished: true,
        ...filter,
      });
      expect(mockCourse.countDocuments).toHaveBeenCalledWith({
        isPublished: true,
        ...filter,
      });
    });
  });

  describe("findOnePublic", () => {
    it("should return a public course by valid id", async () => {
      const mockDoc = {
        _id: "507f1f77bcf86cd799439011",
        name: "Course 1",
        description: "desc",
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDoc),
      };

      mockCourse.findOne.mockReturnValue(mockQuery as any);

      const result = await repository.findOnePublic("507f1f77bcf86cd799439011");

      expect(mockCourse.findOne).toHaveBeenCalledWith({
        _id: "507f1f77bcf86cd799439011",
        isPublished: true,
      });
      expect(result).not.toBeNull();
    });

    it("should return null for invalid id", async () => {
      const result = await repository.findOnePublic("invalid");

      expect(result).toBeNull();
      expect(mockCourse.findOne).not.toHaveBeenCalled();
    });

    it("should return null if course not found", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      };

      mockCourse.findOne.mockReturnValue(mockQuery as any);

      const result = await repository.findOnePublic("507f1f77bcf86cd799439011");

      expect(result).toBeNull();
    });

    it("should throw error on database error", async () => {
      const error = new Error("DB error");
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(error),
      };

      mockCourse.findOne.mockReturnValue(mockQuery as any);

      await expect(
        repository.findOnePublic("507f1f77bcf86cd799439011"),
      ).rejects.toThrow("DB error");
    });
  });
});
