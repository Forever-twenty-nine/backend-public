import { Schema, ObjectId } from "mongoose";
import generalConnection from "@/config/databases";

export interface IBusinessTraining {
  _id?: ObjectId;
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
}

export const BusinessTrainingSchema: Schema<IBusinessTraining> = new Schema<IBusinessTraining>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true },
);

const BusinessTraining = generalConnection.model<IBusinessTraining>(
  "BusinessTraining",
  BusinessTrainingSchema,
  "businesstrainings",
);

export { BusinessTraining };


