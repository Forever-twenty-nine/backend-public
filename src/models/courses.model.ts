/**
 * Course model interfaces
 * para la lista de cursos públicos
 */
export interface ICourse {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  published: boolean;
  price?: number;
  startDate?: string;
  registrationOpenDate?: string;
  endDate?: string;
  modality?: string;
  duration?: number;
  time?: string;
  days?: string[];
  maxInstallments?: number;
  interestFree?: boolean;
  programUrl?: string;
}

/**
 * Public course details interface
 * para el detalle público de un curso
 */
export interface IPublicCourseTeacher {
  firstName?: string;
  lastName?: string;
  professionalDescription?: string;
  profilePhotoUrl?: string;
}

export interface IPublicCourse {
  _id: string;
  name: string;
  description?: string;
  longDescription?: string;
  imageUrl?: string;
  price?: number;
  modality?: string;
  duration?: number;
  teachers?: IPublicCourseTeacher[];
  isFree?: boolean;
  startDate?: string;
  registrationOpenDate?: string;
  days?: string[];
  time?: string;
  programUrl?: string;
  maxInstallments?: number;
  interestFree?: boolean;
}

// Mapper helpers: centralizan qué campos públicos se exponen
export function mapToICourse(doc: any): ICourse {
  return {
    _id: String(doc._id),
    name: doc.name,
    description: doc.description,
    imageUrl: doc.imageUrl,
    published: Boolean(doc.isPublished ?? doc.published ?? true),
    price: typeof doc.price === "number" ? doc.price : undefined,
    startDate: doc.startDate ? String(doc.startDate) : undefined,
    registrationOpenDate: doc.registrationOpenDate
      ? String(doc.registrationOpenDate)
      : undefined,
    endDate: doc.endDate ? String(doc.endDate) : undefined,
    modality: doc.modality || undefined,
    duration: typeof doc.duration === "number" ? doc.duration : undefined,
    time: doc.time || undefined,
    days: Array.isArray(doc.days) ? doc.days : undefined,
    maxInstallments:
      typeof doc.maxInstallments === "number" ? doc.maxInstallments : undefined,
    interestFree: Boolean(doc.interestFree),
    programUrl: doc.programUrl || undefined,
    // no incluir teachers en listado (solo en detalle)
  };
}

export function mapToIPublicCourse(doc: any): IPublicCourse {
  try {
    const result: IPublicCourse = {
      _id: String(doc._id),
      name: doc.name || "",
      description: doc.description || undefined,
      longDescription: doc.longDescription || undefined,
      imageUrl: doc.imageUrl || undefined,
      price: typeof doc.price === "number" ? doc.price : undefined,
      modality: doc.modality || undefined,
      duration: typeof doc.duration === "number" ? doc.duration : undefined,
      teachers: Array.isArray(doc.teachers) && doc.teachers.length > 0
        ? doc.teachers
            .filter((t: any) => t && typeof t === 'object' && !t._bsontype) // Filtrar ObjectIds
            .map((t: any) => ({
              firstName: t.firstName,
              lastName: t.lastName,
              professionalDescription: t.professionalDescription,
              profilePhotoUrl: t.profilePhotoUrl
                ? (t.profilePhotoUrl.startsWith('http') 
                    ? t.profilePhotoUrl 
                    : `https://cursala.b-cdn.net/profile-images/${t.profilePhotoUrl}`)
                : undefined,
            }))
        : undefined,
      isFree: !doc.price || doc.price === 0,
      startDate: doc.startDate ? String(doc.startDate) : undefined,
      registrationOpenDate: doc.registrationOpenDate
        ? String(doc.registrationOpenDate)
        : undefined,
      days: Array.isArray(doc.days) ? doc.days : undefined,
      time: doc.time || undefined,
      programUrl: doc.programUrl || undefined,
      maxInstallments:
        typeof doc.maxInstallments === "number"
          ? doc.maxInstallments
          : undefined,
      interestFree: Boolean(doc.interestFree),
    };
    return result;
  } catch (error) {
    console.error("Error mapping course to public interface:", error, doc);
    throw error;
  }
}
