import { Schema, ObjectId } from "mongoose";
import generalConnection from "@/config/databases";

export interface IClass {
  _id: ObjectId;
  course?: ObjectId | string;
  courseId?: ObjectId | string;
  title?: string;
  description?: string;
  startDate?: Date;
  duration?: number;
}

export const ClassSchema: Schema<IClass> = new Schema<IClass>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    title: { type: String },
    description: { type: String },
    startDate: { type: Date },
    duration: { type: Number, min: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Class = generalConnection.model<IClass>("Class", ClassSchema, "classes");
export { Class };
