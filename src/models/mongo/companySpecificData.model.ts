import { Schema, model, Document } from 'mongoose';
import { Types, Connection } from '@/models';
import generalConnection from '@/config/databases';

export interface ICompanySpecificData extends Document {
  _id: Types.ObjectId;
  privacyPolicy: string;
  termsOfService: string;
}

const DEFAULT_PRIVACY_POLICY = 'Esta es la política de privacidad por defecto.';
export const DEFAULT_TERMS_OF_SERVICE = 'Estos son los términos de servicio por defecto.';

export const CompanySpecificDataSchema: Schema<ICompanySpecificData> = new Schema<ICompanySpecificData>(
  {
    privacyPolicy: {
      type: String,
      required: true,
      default: DEFAULT_PRIVACY_POLICY,
      trim: true,
    },
    termsOfService: {
      type: String,
      default: DEFAULT_TERMS_OF_SERVICE,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Usar la conexión específica en lugar de la global
export default generalConnection.model<ICompanySpecificData>('CompanySpecificData', CompanySpecificDataSchema);