import { Schema } from "mongoose";
import generalConnection from "@/config/databases";

export interface IPromotionalCode {
  _id: any;
  code: string;
  name?: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  status?: string;
  applicableCourses?: any[];
  isGlobal?: boolean;
  validFrom?: Date;
  validUntil?: Date;
}

export const PromotionalCodeSchema: Schema<IPromotionalCode> = new Schema(
  {
    code: { type: String, required: true },
    name: { type: String },
    description: { type: String },
    discountType: { type: String },
    discountValue: { type: Number },
    status: { type: String },
    applicableCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    isGlobal: { type: Boolean, default: false },
    validFrom: { type: Date },
    validUntil: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

const PromotionalCode = generalConnection.model<IPromotionalCode>(
  "PromotionalCode",
  PromotionalCodeSchema,
  "promotionalCodes",
);

export { PromotionalCode };
