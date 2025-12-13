// User types removed from public backend. Keep minimal placeholders to avoid breaking imports.
export interface IUserExtended {
  _id?: string | { toString(): string } | null;
  professionalDescription?: string;
  profilePhotoUrl?: string;
  professionalSignatureUrl?: string;
}
