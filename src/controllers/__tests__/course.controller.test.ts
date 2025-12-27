/* eslint-env jest */
import { Request, Response, NextFunction } from "express";
import CourseController from "../course.controller";
import { courseService } from "../../services";

jest.mock("../../services");

const mockCourseService = courseService as jest.Mocked<typeof courseService>;

describe("CourseController", () => {
  let controller: CourseController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new CourseController();

    mockReq = {
      query: {},
      params: {},
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findForHome", () => {
    it("should return courses for home successfully", async () => {
      const items = [{ id: "1", title: "Course 1" }];
      mockCourseService.findForHome.mockResolvedValue(items as any);

      await controller.findForHome(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockCourseService.findForHome).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        message: "Cursos para inicio obtenidos exitosamente",
        data: items,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with error on service failure", async () => {
      const error = new Error("Service error");
      mockCourseService.findForHome.mockRejectedValue(error);

      await controller.findForHome(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockCourseService.findForHome).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("findPublished", () => {
    it("should return published courses with pagination", async () => {
      const result = { courses: [{ id: "1" }], total: 1 };
      mockReq.query = { page: "1", size: "10" };
      mockCourseService.findPublished.mockResolvedValue(result as any);

      await controller.findPublished(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockCourseService.findPublished).toHaveBeenCalledWith(1, 10, {});
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        message: "Cursos publicados obtenidos exitosamente",
        data: result,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("findOnePublic", () => {
    it("should return course if found", async () => {
      const course = { id: "1", title: "Course 1" };
      mockReq.params = { courseId: "1" };
      mockCourseService.findOnePublic.mockResolvedValue(course as any);

      await controller.findOnePublic(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockCourseService.findOnePublic).toHaveBeenCalledWith("1");
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        message: "Curso obtenido exitosamente",
        data: course,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 404 if course not found", async () => {
      mockReq.params = { courseId: "1" };
      mockCourseService.findOnePublic.mockResolvedValue(null);

      await controller.findOnePublic(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockCourseService.findOnePublic).toHaveBeenCalledWith("1");
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 404,
        message: "Curso no encontrado",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with error on service failure", async () => {
      const error = new Error("Service error");
      mockReq.params = { courseId: "1" };
      mockCourseService.findOnePublic.mockRejectedValue(error);

      await controller.findOnePublic(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockCourseService.findOnePublic).toHaveBeenCalledWith("1");
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});
