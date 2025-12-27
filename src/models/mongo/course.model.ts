import { Schema, ObjectId } from "mongoose";
import generalConnection from "@/config/databases";

export interface ICourse {
  _id: ObjectId;
  name: string;
  description?: string;
  longDescription?: string;
  status: string;
  order: number;
  imageUrl?: string;
  meta?: {
    popularity: number;
  };
  days?: string[];
  time?: string;
  startDate?: Date;
  registrationOpenDate?: Date; // Fecha de apertura de inscripciones
  modality?: string;
  price?: number;
  programUrl?: string;
  maxInstallments: number;
  interestFree: boolean;
  showOnHome?: boolean;
  mainTeacher?: ObjectId;
  duration?: number; // Duración del curso en horas
  isPublished?: boolean; // Switch de publicación
}

export const CourseSchema: Schema<ICourse> = new Schema<ICourse>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    longDescription: { type: String },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    order: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, match: /\.(jpg|jpeg|png|webp)$/i },
    meta: {
      popularity: { type: Number, min: 0, max: 5, default: 0 },
    },
    days: { type: [String] },
    time: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    startDate: { type: Date },
    registrationOpenDate: { type: Date }, // Fecha de apertura de inscripciones
    modality: { type: String },
    price: { type: Number, min: 0 },
    programUrl: { type: String, match: /\.pdf$/i },
    maxInstallments: { type: Number, min: 1 },
    interestFree: { type: Boolean },
    showOnHome: { type: Boolean, default: false },
    mainTeacher: { type: Schema.Types.ObjectId, ref: "User" },
    duration: { type: Number, min: 0.5 }, // Duración del curso en horas
    isPublished: { type: Boolean, default: true }, // Por defecto publicado
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Course = generalConnection.model<ICourse>(
  "Course",
  CourseSchema,
  "courses",
);
export { Course };
