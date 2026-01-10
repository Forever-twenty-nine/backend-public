import { Types } from "mongoose";
import { Course } from "@models/mongo/course.model";
import { User } from "@models/mongo/user.model"; // Importar User para registrar el modelo
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

    const courseIds = (docs as any[]).map((d: any) => String(d._id));
    try {
      const promo = await (await import("@repositories/promotionalCode.repository")).default.findActiveForCourseIds(courseIds);
      const promoSet = new Set(promo.courseIds);
      return (docs as any[]).map((d: any) => {
        const mapped = mapToICourse(d);
        mapped.hasPromotionalCode = Boolean(promo.global || promoSet.has(String(d._id)));
        return mapped;
      });
    } catch (e) {
      return (docs as any[]).map((d: any) => mapToICourse(d));
    }
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
    const courseIds = (itemsRaw as any[]).map((d: any) => String(d._id));
    try {
      const promo = await (await import("@repositories/promotionalCode.repository")).default.findActiveForCourseIds(courseIds);
      const promoSet = new Set(promo.courseIds);
      const items = (itemsRaw as any[]).map((d: any) => {
        const mapped = mapToICourse(d);
        mapped.hasPromotionalCode = Boolean(promo.global || promoSet.has(String(d._id)));
        return mapped;
      });
      return { items, total };
    } catch (e) {
      const items = (itemsRaw as any[]).map((d: any) => mapToICourse(d));
      return { items, total };
    }
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
        .populate({
          path: 'teachers',
          select: 'firstName lastName professionalDescription profilePhotoUrl'
        })
        .lean();

      const doc = result || null;

      if (!doc) return null;

      try {
        const promo = await (await import("@repositories/promotionalCode.repository")).default.findActiveForCourseIds([id]);
        const mapped = mapToIPublicCourse(doc);
        mapped.hasPromotionalCode = Boolean(promo.global || (promo.courseIds || []).includes(String(id)));
        return mapped;
      } catch (e) {
        return mapToIPublicCourse(doc);
      }
    } catch (error) {
      console.error("Error in findOnePublic repository:", error);
      throw error;
    }
  }
}

export default new CourseRepository();
