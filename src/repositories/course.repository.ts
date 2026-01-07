import { Types } from "mongoose";
import { Course } from "@models/mongo/course.model";
import {
  ICourse,
  IPublicCourse,
  mapToICourse,
  mapToIPublicCourse,
} from "@models/courses.model";

class CourseRepository {
  async findForHome(limit = 12): Promise<ICourse[]> {
    const docs = await Course.find({ isPublished: true, showOnHome: true })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select({
        name: 1,
        imageUrl: 1,
        description: 1,
        price: 1,
        startDate: 1,
        registrationOpenDate: 1,
        endDate: 1,
        modality: 1,
        duration: 1,
        time: 1,
        days: 1,
        maxInstallments: 1,
        interestFree: 1,
        programUrl: 1,
      })
      .lean();

    return (docs as any[]).map((d: any) => mapToICourse(d));
  }

  async findPublished(
    page = 1,
    size = 20,
    filter: Record<string, any> = {},
  ): Promise<{ items: ICourse[]; total: number }> {
    const skip = (page - 1) * size;
    const matchQuery = { isPublished: true, ...filter };

    const itemsRaw = await Course.find(matchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .select({
        name: 1,
        imageUrl: 1,
        description: 1,
        price: 1,
        startDate: 1,
        registrationOpenDate: 1,
        endDate: 1,
        modality: 1,
        duration: 1,
        time: 1,
        days: 1,
        maxInstallments: 1,
        interestFree: 1,
        programUrl: 1,
      })
      .lean();

    const total = await Course.countDocuments(matchQuery);
    const items = (itemsRaw as any[]).map((d: any) => mapToICourse(d));

    return { items, total };
  }

  async findOnePublic(id: string): Promise<IPublicCourse | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      return null;
    }

    // Validar que el ID sea un ObjectId válido
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    try {
      // Use string id in queries to allow mocked models to receive the same value
      const query: any = { _id: id, isPublished: true };
      const result = await Course.findOne(query)
        .select({
          name: 1,
          description: 1,
          longDescription: 1,
          imageUrl: 1,
          price: 1,
          modality: 1,
          duration: 1,
          teachers: 1,
          startDate: 1,
          registrationOpenDate: 1,
          days: 1,
          time: 1,
          programUrl: 1,
          maxInstallments: 1,
          interestFree: 1,
        })
        .lean();

      const doc = result || null;

      if (!doc) return null;

      return mapToIPublicCourse(doc);
    } catch (error) {
      console.error("Error in findOnePublic repository:", error);
      throw error;
    }
  }
}

export default new CourseRepository();
