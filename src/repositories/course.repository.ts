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
        mainTeacherInfo: 1,
      })
      .lean();

    return docs.map((d: any) => mapToICourse(d));
  }

  async findPublished(
    page = 1,
    size = 20,
    filter: Record<string, any> = {},
  ): Promise<{ items: ICourse[]; total: number }> {
    const skip = (page - 1) * size;
    const query = { isPublished: true, ...filter };

    const [itemsRaw, total] = await Promise.all([
      Course.find(query)
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
          mainTeacherInfo: 1,
        })
        .lean(),
      Course.countDocuments(query),
    ]);

    const items = itemsRaw.map((d: any) => mapToICourse(d));

    return { items, total };
  }

  async findOnePublic(id: string): Promise<IPublicCourse | null> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return null;
    }

    // Validar que el ID sea un ObjectId válido
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    try {
      const objectId = new Types.ObjectId(id);

      // Usamos la conexión nativa de MongoDB con projection
      const doc: any = await Course.collection.findOne(
        {
          _id: objectId,
          isPublished: true,
        },
        {
          projection: {
            name: 1,
            description: 1,
            longDescription: 1,
            imageUrl: 1,
            price: 1,
            modality: 1,
            duration: 1,
            mainTeacherInfo: 1,
            startDate: 1,
            registrationOpenDate: 1,
            days: 1,
            time: 1,
            programUrl: 1,
            maxInstallments: 1,
            interestFree: 1,
          },
        }
      );

      if (!doc) return null;

      return mapToIPublicCourse(doc);
    } catch (error) {
      console.error("Error in findOnePublic repository:", error);
      throw error;
    }
  }
}

export default new CourseRepository();
