import mongoose from 'mongoose';
import { logger } from '../utils';
import { PromotionalCode, IPromotionalCode, PromotionalCodeStatus } from '@/models/mongo/promotionalCode.model';
import { Course } from '@/models/mongo/course.model';

export default class PromotionalCodeService {
  // Crear nuevo código promocional
  async createPromotionalCode(data: Partial<IPromotionalCode>): Promise<IPromotionalCode> {
    try {
      // Verificar que el código no exista
      const existingCode = await PromotionalCode.findOne({
        code: data.code?.toUpperCase(),
      }).exec();

      if (existingCode) {
        throw new Error('Ya existe un código promocional con ese nombre');
      }

      // Validar cursos aplicables si no es global
      if (!data.isGlobal && data.applicableCourses && data.applicableCourses.length > 0) {
        const applicableCoursesIds = data.applicableCourses.map((c: unknown) => String(c));
        const courseObjectIds = applicableCoursesIds.map((id) => new mongoose.Types.ObjectId(id));
        const coursesExist = await Course.find({
          _id: { $in: courseObjectIds },
        }).exec();

        if (coursesExist.length !== applicableCoursesIds.length) {
          throw new Error('Algunos cursos especificados no existen');
        }
      }

      const promotionalCode = new PromotionalCode({
        ...data,
        code: data.code?.toUpperCase(),
        usedCount: 0,
        usageHistory: [],
      });

      const savedCode = await promotionalCode.save();
      logger.info(`Código promocional creado: ${savedCode.code}`);

      return savedCode;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error al crear código promocional: ${err.message}`);
      throw error;
    }
  }

  // Obtener todos los códigos promocionales (excluyendo los eliminados)
  async getAllPromotionalCodes(): Promise<IPromotionalCode[]> {
    try {
      const codes = await PromotionalCode.find({
        status: { $ne: PromotionalCodeStatus.DELETED },
      })
        .populate('applicableCourses', 'name price')
        .populate('createdBy', 'firstName lastName email')
        .populate('lastModifiedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .exec();

      return codes;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error al obtener códigos promocionales: ${err.message}`);
      throw error;
    }
  }

  // Obtener código promocional por ID (excluyendo los eliminados)
  async getPromotionalCodeById(id: string): Promise<IPromotionalCode | null> {
    try {
      const code = await PromotionalCode.findOne({
        _id: id,
        status: { $ne: PromotionalCodeStatus.DELETED },
      })
        .populate('applicableCourses', 'name price')
        .populate('createdBy', 'firstName lastName email')
        .populate('lastModifiedBy', 'firstName lastName email')
        .exec();

      return code;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error al obtener código promocional por ID: ${err.message}`);
      throw error;
    }
  }

  // Obtener código promocional por código (excluyendo los eliminados)
  async getPromotionalCodeByCode(code: string): Promise<IPromotionalCode | null> {
    try {
      const promotionalCode = await PromotionalCode.findOne({
        code: code.toUpperCase(),
        status: { $ne: PromotionalCodeStatus.DELETED },
      }).populate('applicableCourses', 'name price').exec();

      return promotionalCode;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error al obtener código promocional por código: ${err.message}`);
      throw error;
    }
  }

  // Actualizar código promocional
  async updatePromotionalCode(
    id: string,
    data: Partial<IPromotionalCode>,
    modifiedBy: mongoose.Types.ObjectId | undefined
  ): Promise<IPromotionalCode | null> {
    try {
      const updateData: Partial<IPromotionalCode> = { ...data };
      // Si se está cambiando el código, verificar que no exista
      if (updateData.code) {
        const existingCode = await PromotionalCode.findOne({
          code: updateData.code.toUpperCase(),
          _id: { $ne: id },
        }).exec();

        if (existingCode) {
          throw new Error('Ya existe un código promocional con ese nombre');
        }
        updateData.code = updateData.code.toUpperCase();
      }

      // Validar cursos aplicables si no es global
      if (updateData.isGlobal === false && updateData.applicableCourses && updateData.applicableCourses.length > 0) {
        const applicableCoursesIds = updateData.applicableCourses.map((c: unknown) => String(c));
        const courseObjectIds = applicableCoursesIds.map((cid) => new mongoose.Types.ObjectId(cid));
        const coursesExist = await Course.find({
          _id: { $in: courseObjectIds },
        }).exec();

        if (coursesExist.length !== applicableCoursesIds.length) {
          throw new Error('Algunos cursos especificados no existen');
        }
      }

      const updatedCode = await PromotionalCode.findByIdAndUpdate(
        id,
        {
          ...updateData,
          lastModifiedBy: modifiedBy,
        },
        { new: true }
      ).populate('applicableCourses', 'name price').exec();

      if (updatedCode) {
        logger.info(`Código promocional actualizado: ${updatedCode.code}`);
      }

      return updatedCode;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error al actualizar código promocional: ${err.message}`);
      throw error;
    }
  }

  // Pausar código promocional
  async pausePromotionalCode(id: string, modifiedBy: mongoose.Types.ObjectId | undefined): Promise<IPromotionalCode | null> {
    try {
      return await this.updatePromotionalCode(
        id,
        {
          status: PromotionalCodeStatus.PAUSED,
        },
        modifiedBy
      );
    } catch (error) {
      const err = error as Error;
      logger.error(`Error al pausar código promocional: ${err.message}`);
      throw error;
    }
  }

  // Activar código promocional
  async activatePromotionalCode(id: string, modifiedBy: mongoose.Types.ObjectId | undefined): Promise<IPromotionalCode | null> {
    try {
      return await this.updatePromotionalCode(
        id,
        {
          status: PromotionalCodeStatus.ACTIVE,
        },
        modifiedBy
      );
    } catch (error) {
      const err = error as Error;
      logger.error(`Error al activar código promocional: ${err.message}`);
      throw error;
    }
  }

  // Eliminar código promocional (soft delete)
  async deletePromotionalCode(id: string, modifiedBy: mongoose.Types.ObjectId | undefined): Promise<IPromotionalCode | null> {
    try {
      return await this.updatePromotionalCode(
        id,
        {
          status: PromotionalCodeStatus.DELETED,
        },
        modifiedBy
      );
    } catch (error) {
      const err = error as Error;
      logger.error(`Error al eliminar código promocional: ${err.message}`);
      throw error;
    }
  }

  // Aplicar código promocional (registrar uso)
  async applyPromotionalCode(
    codeId: string,
    userId: string,
    courseId: string,
    discountApplied: number
  ): Promise<boolean> {
    try {
      const promotionalCode = await PromotionalCode.findById(codeId).exec();

      if (!promotionalCode) {
        throw new Error('Código promocional no encontrado');
      }

      // Registrar uso
      promotionalCode.usedCount += 1;
      if (!promotionalCode.usageHistory) {
        promotionalCode.usageHistory = [];
      }
      promotionalCode.usageHistory.push({
        userId: new mongoose.Types.ObjectId(userId),
        courseId: new mongoose.Types.ObjectId(courseId),
        usedAt: new Date(),
        discountApplied,
      });

      await promotionalCode.save();

      logger.info(`Código promocional aplicado: ${promotionalCode.code} por usuario ${userId}`);
      return true;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error al aplicar código promocional: ${err.message}`);
      throw error;
    }
  }

  // Obtener estadísticas de códigos promocionales
  async getPromotionalCodeStats(): Promise<{
    totalCodes: number;
    activeCodes: number;
    pausedCodes: number;
    totalUsage: number;
    totalDiscountGiven: number;
  }> {
    try {
      const totalCodes = await PromotionalCode.countDocuments({
        status: { $ne: PromotionalCodeStatus.DELETED },
      });

      const activeCodes = await PromotionalCode.countDocuments({
        status: PromotionalCodeStatus.ACTIVE,
      });

      const pausedCodes = await PromotionalCode.countDocuments({
        status: PromotionalCodeStatus.PAUSED,
      });

      const usageStats = await PromotionalCode.aggregate([
        { $match: { status: { $ne: PromotionalCodeStatus.DELETED } } },
        {
          $group: {
            _id: null,
            totalUsage: { $sum: '$usedCount' },
            totalDiscountGiven: {
              $sum: {
                $reduce: {
                  input: '$usageHistory',
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.discountApplied'] },
                },
              },
            },
          },
        },
      ]).exec();

      const stats = usageStats[0] || { totalUsage: 0, totalDiscountGiven: 0 };

      return {
        totalCodes,
        activeCodes,
        pausedCodes,
        totalUsage: stats.totalUsage,
        totalDiscountGiven: stats.totalDiscountGiven,
      };
    } catch (error) {
      const err = error as Error;
      logger.error(`Error al obtener estadísticas: ${err.message}`);
      throw error;
    }
  }

  // Obtener un mapa de cursos que tienen al menos un código promocional activo aplicable
  async getActivePromotionsForCourses(courseIds: string[]): Promise<Record<string, boolean>> {
    if (!courseIds || courseIds.length === 0) return {};

    const now = new Date();
    // Filtrar IDs válidos y convertir a ObjectId de forma segura
    const validIds: mongoose.Types.ObjectId[] = [];
    const validIdStrings: string[] = [];

    courseIds.filter(Boolean).forEach((id) => {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          validIds.push(new mongoose.Types.ObjectId(id));
          validIdStrings.push(id);
        }
      } catch (error) {
        logger.warn(`Invalid ObjectId format: ${id}, skipping`);
      }
    });

    if (validIds.length === 0) {
      logger.info('No valid courseIds provided, returning empty map');
      return {};
    }

    try {
      // Buscar códigos potencialmente válidos por query (rápido)
      const candidateCodes = await PromotionalCode.find({
        status: PromotionalCodeStatus.ACTIVE,
        $and: [
          {
            $or: [{ validFrom: { $exists: false } }, { validFrom: null }, { validFrom: { $lte: now } }],
          },
          {
            $or: [{ validUntil: { $exists: false } }, { validUntil: null }, { validUntil: { $gte: now } }],
          },
          {
            $or: [{ maxUses: { $exists: false } }, { maxUses: null }, { $expr: { $lt: ['$usedCount', '$maxUses'] } }],
          },
        ],
        $or: [{ isGlobal: true }, { applicableCourses: { $in: validIds } }],
      }).select('isGlobal applicableCourses status validFrom validUntil usedCount maxUses').exec();

      // Validar con lógica de negocio (isValid) por seguridad
      const validCodes = candidateCodes.filter((code: unknown) => {
        try {
          return (code as unknown as IPromotionalCode).isValid?.() === true;
        } catch (error) {
          logger.warn(`Error validating promotional code: ${error}`);
          return false;
        }
      });

      const result: Record<string, boolean> = {};

      // Marcar cursos con códigos globales
      if (validCodes.some((c: unknown) => Boolean((c as unknown as IPromotionalCode).isGlobal))) {
        validIdStrings.forEach((id) => {
          result[id] = true;
        });
      }

      // Marcar cursos específicos
      validCodes.forEach((code: unknown) => {
        const promo = code as unknown as IPromotionalCode & { applicableCourses?: mongoose.Types.ObjectId[] };
        if (!promo.isGlobal && Array.isArray(promo.applicableCourses)) {
          (promo.applicableCourses as mongoose.Types.ObjectId[]).forEach((cid) => {
            const key = cid.toString();
            if (validIdStrings.includes(key)) {
              result[key] = true;
            }
          });
        }
      });

      return result;
    } catch (error) {
      logger.error(`Error in getActivePromotionsForCourses: ${(error as Error).message}`);
      // En caso de error, devolver mapa vacío para no romper la app
      return {};
    }
  }
}
