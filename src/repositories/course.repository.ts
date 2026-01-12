import { Types } from "mongoose";
import { Course } from "@models/mongo/course.model";
// Registrar el modelo `User` en Mongoose por efecto secundario
import "@models/mongo/user.model";
import {
  ICourse,
  IPublicCourse,
  mapToICourse,
  mapToIPublicCourse,
} from "@models/courses.model";

class CourseRepository {

  /**
   * Busca cursos publicados para mostrar en la página de inicio.
   * @param limit Número máximo de cursos a retornar.
   * @returns Lista de cursos publicados para la página de inicio.
   */
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

  /**
   * Busca cursos publicados con paginación y filtros.
   * @param page Número de página.
   * @param size Tamaño de página.
   * @param filter Filtros adicionales.
   * @returns Objeto con items y total de cursos publicados.
   */
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

  /**
   * Busca un curso publicado por su ID.
   * @param id ID del curso.
   * @returns Curso público o null si no se encuentra.
   */
  async findOnePublic(id: string): Promise<IPublicCourse | null> {
    if (!id || typeof id !== "string" || id.trim() === "") {
      return null;
    }

    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    try {
      const query: any = { _id: id, isPublished: true };
      const queryBuilder: any = Course.findOne(query).select({
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
      });

      // Algunos tests mockean `Course.findOne()` y no exponen `populate()`.
      // Llamar a populate sólo si está disponible en el objeto retornado.
      if (typeof queryBuilder.populate === "function") {
        queryBuilder.populate({
          path: "teachers",
          select: "firstName lastName professionalDescription profilePhotoUrl",
        });
      }

      const result = await queryBuilder.lean();

      const doc = result || null;

      if (!doc) return null;

      try {
        const promo = await (await import("@repositories/promotionalCode.repository")).default.findActiveForCourseIds([id]);
        const mapped = mapToIPublicCourse(doc);
        mapped.hasPromotionalCode = Boolean(promo.global || (promo.courseIds || []).includes(String(id)));

        // Si el mapeo no pudo determinar `isWorkshop` (no venían clases embebidas),
        // intentar contar las clases en una colección `Class` si existe.
        if (mapped.isWorkshop === undefined) {
          try {
            const clsMod = await import("@models/mongo/class.model");
            const ClassModel: any = clsMod.Class || clsMod.default;
            if (ClassModel && typeof ClassModel.countDocuments === "function") {
              const candidates = ["course", "courseId", "course_id"];
              let count = 0;
              for (const field of candidates) {
                const q: any = {};
                if (Types.ObjectId.isValid(id)) q[field] = new Types.ObjectId(id);
                else q[field] = id;
                count = await ClassModel.countDocuments(q);
                if (count > 0) break;
              }
              mapped.isWorkshop = count === 1;
            }
          } catch (inner) {
            // Si no existe la colección/modelo `Class` o falla, no interferimos.
          }
        }

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
