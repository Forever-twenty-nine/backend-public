import { Schema, ObjectId } from "mongoose";
import generalConnection from "@/config/databases";

export interface IUser {
  _id: ObjectId;
  firstName?: string;
  lastName?: string;
  professionalDescription?: string;
  profilePhotoUrl?: string;
}

export const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    firstName: { type: String },
    lastName: { type: String },
    professionalDescription: { type: String },
    profilePhotoUrl: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: false, // Permitir campos adicionales que no necesitamos
  },
);

const User = generalConnection.model<IUser>("User", UserSchema, "users");

export { User };
