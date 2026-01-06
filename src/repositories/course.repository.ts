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
    const pipeline = [
      {
        $match: {
          isPublished: true,
          showOnHome: true,
        },
      },
      {
        // Se usa solo el array `teachers` poblado más abajo
      },
      {
        // no poblar teachers en lista paginada (solo detalle los incluirá)
      },
        // no poblar teachers en lista de home (solo detalle lo mostrará)
      {
        $sort: { updatedAt: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
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
          // no incluir teachers en lista de home
        },
      },
    ];

    const docs = await Course.collection.aggregate(pipeline).toArray();
    return docs.map((d: any) => mapToICourse(d));
  }

  async findPublished(
    page = 1,
    size = 20,
    filter: Record<string, any> = {},
  ): Promise<{ items: ICourse[]; total: number }> {
    const skip = (page - 1) * size;
    const matchQuery = { isPublished: true, ...filter };

    const pipeline = [
      {
        $match: matchQuery,
      },
      {
        // Se usa solo el array `teachers` poblado más abajo
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: size,
      },
      {
        $project: {
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
          // no incluir teachers en lista paginada
        },
      },
    ];

    const countPipeline = [
      {
        $match: matchQuery,
      },
      {
        $count: 'total',
      },
    ];

    const [itemsRaw, countResult] = await Promise.all([
      Course.collection.aggregate(pipeline).toArray(),
      Course.collection.aggregate(countPipeline).toArray(),
    ]);

    const total = countResult[0]?.total || 0;
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

      // Usar aggregation pipeline; `mainTeacherInfo` eliminado: ahora usamos solo `teachers` array
      const pipeline = [
        {
          $match: {
            _id: objectId,
            isPublished: true,
          },
        },
        {
          // Poblar teachers para detalle
          $lookup: {
            from: 'users',
            localField: 'teachers',
            foreignField: '_id',
            as: 'teachers',
            pipeline: [
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  professionalDescription: { $ifNull: ['$professionalDescription', null] },
                  profilePhotoUrl: { $ifNull: ['$profilePhotoUrl', null] },
                },
              },
            ],
          },
        },
        {
          $project: {
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
          },
        },
      ];

      const result = await Course.collection.aggregate(pipeline).toArray();
      const doc = result[0] || null;

      if (!doc) return null;

      return mapToIPublicCourse(doc);
    } catch (error) {
      console.error("Error in findOnePublic repository:", error);
      throw error;
    }
  }
}

export default new CourseRepository();
