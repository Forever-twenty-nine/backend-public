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
  numberOfClasses?: number;
  programUrl?: string;
  mainTeacherInfo?: IPublicCourseTeacher;
}

/**
 * Public course details interface
 * para el detalle público de un curso
 */
export interface IPublicCourseTeacher {
  firstName?: string;
  lastName?: string;
  email?: string;
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
  mainTeacherInfo?: IPublicCourseTeacher;
  isFree?: boolean;
  startDate?: string;
  registrationOpenDate?: string;
  days?: string[];
  time?: string;
  numberOfClasses?: number;
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
    price: typeof doc.price === 'number' ? doc.price : undefined,
    startDate: doc.startDate ? String(doc.startDate) : undefined,
    registrationOpenDate: doc.registrationOpenDate ? String(doc.registrationOpenDate) : undefined,
    endDate: doc.endDate ? String(doc.endDate) : undefined,
    modality: doc.modality || undefined,
    duration: typeof doc.duration === 'number' ? doc.duration : undefined,
    time: doc.time || undefined,
    days: Array.isArray(doc.days) ? doc.days : undefined,
    maxInstallments: typeof doc.maxInstallments === 'number' ? doc.maxInstallments : undefined,
    interestFree: Boolean(doc.interestFree),
    numberOfClasses: typeof doc.numberOfClasses === 'number' ? doc.numberOfClasses : undefined,
    programUrl: doc.programUrl || undefined,
    mainTeacherInfo: doc.mainTeacherInfo ? {
      firstName: doc.mainTeacherInfo.firstName,
      lastName: doc.mainTeacherInfo.lastName,
      email: doc.mainTeacherInfo.email,
      professionalDescription: doc.mainTeacherInfo.professionalDescription,
      profilePhotoUrl: doc.mainTeacherInfo.profilePhotoUrl,
    } : undefined,
  }
}

export function mapToIPublicCourse(doc: any): IPublicCourse {
  try {
    const result: IPublicCourse = {
      _id: String(doc._id),
      name: doc.name || '',
      description: doc.description || undefined,
      longDescription: doc.longDescription || undefined,
      imageUrl: doc.imageUrl || undefined,
      price: typeof doc.price === 'number' ? doc.price : undefined,
      modality: doc.modality || undefined,
      duration: typeof doc.duration === 'number' ? doc.duration : undefined,
      mainTeacherInfo: doc.mainTeacherInfo ? {
        firstName: doc.mainTeacherInfo.firstName,
        lastName: doc.mainTeacherInfo.lastName,
        email: doc.mainTeacherInfo.email,
        professionalDescription: doc.mainTeacherInfo.professionalDescription,
        profilePhotoUrl: doc.mainTeacherInfo.profilePhotoUrl,
      } : undefined,
      isFree: !doc.price || doc.price === 0,
      startDate: doc.startDate ? String(doc.startDate) : undefined,
      registrationOpenDate: doc.registrationOpenDate ? String(doc.registrationOpenDate) : undefined,
      days: Array.isArray(doc.days) ? doc.days : undefined,
      time: doc.time || undefined,
      numberOfClasses: typeof doc.numberOfClasses === 'number' ? doc.numberOfClasses : undefined,
      programUrl: doc.programUrl || undefined,
      maxInstallments: typeof doc.maxInstallments === 'number' ? doc.maxInstallments : undefined,
      interestFree: Boolean(doc.interestFree),
    }
    return result
  } catch (error) {
    console.error('Error mapping course to public interface:', error, doc)
    throw error
  }
}
