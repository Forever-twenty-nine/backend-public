import { Types } from "mongoose";
import { PromotionalCode } from "@models/mongo/promotionalCode.model";

class PromotionalCodeRepository {
  async findActiveForCourseIds(courseIds: string[] = []): Promise<{ global: boolean; courseIds: string[] }> {
    const now = new Date();
    try {
      const objectIds = Array.isArray(courseIds)
        ? courseIds.filter(Boolean).map((id) => (Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null)).filter(Boolean)
        : [];

      const query: any = {
        status: "ACTIVE",
        $and: [
          {
            $or: [
              { isGlobal: true },
              { applicableCourses: { $in: objectIds } },
            ],
          },
        ],
      };

      // date filters (allow missing validFrom/validUntil)
      query.$and.push({ $or: [{ validFrom: { $lte: now } }, { validFrom: { $exists: false } }] });
      query.$and.push({ $or: [{ validUntil: { $gte: now } }, { validUntil: { $exists: false } }] });

      const docs = await PromotionalCode.find(query).select({ applicableCourses: 1, isGlobal: 1 }).lean();

      const resultSet = new Set<string>();
      let global = false;

      for (const d of docs as any[]) {
        if (d.isGlobal) {
          global = true;
        }
        if (Array.isArray(d.applicableCourses)) {
          for (const a of d.applicableCourses) {
            try {
              const sid = String(a._id ?? a);
              if (sid) resultSet.add(sid);
            } catch (e) {
              // ignore
            }
          }
        }
      }

      return { global, courseIds: Array.from(resultSet) };
    } catch (err) {
      return { global: false, courseIds: [] };
    }
  }
}

export default new PromotionalCodeRepository();
