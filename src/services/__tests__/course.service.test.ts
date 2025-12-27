/* eslint-env jest */
import CourseService from "../course.service";
import courseRepository from "../../repositories/course.repository";

jest.mock("../../repositories/course.repository");

const mockRepo = courseRepository as jest.Mocked<typeof courseRepository>;

describe("CourseService", () => {
  let service: CourseService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CourseService();
  });

  describe("findForHome", () => {
    it("returns courses from repository", async () => {
      const mockCourses = [{ _id: "1", name: "A" }] as any;
      mockRepo.findForHome.mockResolvedValue(mockCourses);

      const result = await service.findForHome();

      expect(mockRepo.findForHome).toHaveBeenCalled();
      expect(result).toEqual(mockCourses);
    });

    it("wraps repository errors", async () => {
      mockRepo.findForHome.mockRejectedValue(new Error("db failed"));

      await expect(service.findForHome()).rejects.toThrow(
        "Error fetching courses for home: db failed",
      );
    });
  });

  describe("findPublished", () => {
    it("returns paged published courses", async () => {
      const payload = { items: [{ _id: "2", name: "B" }] as any, total: 1 };
      mockRepo.findPublished.mockResolvedValue(payload);

      const result = await service.findPublished(2, 10, { category: "x" });

      expect(mockRepo.findPublished).toHaveBeenCalledWith(2, 10, {
        category: "x",
      });
      expect(result).toEqual(payload);
    });

    it("wraps repository errors", async () => {
      mockRepo.findPublished.mockRejectedValue(new Error("count error"));

      await expect(service.findPublished(1, 20)).rejects.toThrow(
        "Error fetching published courses: count error",
      );
    });
  });

  describe("findOnePublic", () => {
    it("returns a public course when found", async () => {
      const course = { _id: "3", name: "C" } as any;
      mockRepo.findOnePublic.mockResolvedValue(course);

      const result = await service.findOnePublic("3");

      expect(mockRepo.findOnePublic).toHaveBeenCalledWith("3");
      expect(result).toEqual(course);
    });

    it("returns null when not found", async () => {
      mockRepo.findOnePublic.mockResolvedValue(null);

      const result = await service.findOnePublic("nonexistent");

      expect(result).toBeNull();
    });

    it("wraps repository errors including id in message", async () => {
      mockRepo.findOnePublic.mockRejectedValue(new Error("lookup fail"));

      await expect(service.findOnePublic("abc")).rejects.toThrow(
        "Error fetching public course abc: lookup fail",
      );
    });
  });
});
