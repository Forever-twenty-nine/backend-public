import generalConnection from '../config/databases';

import UserRepository from './user.repository';
import CourseRepository from './course.repository';
import IWantToTrainRepository from './iwanttotrain.repository';
import RequestACourseRepository from './requestACourse.repository';
import BusinessTrainingRepository from './businessTraining.repository';
import FAQRepository from './faq.repository';
import CertificateRepository from './certificate.repository';

export const userRepository = new UserRepository(generalConnection);
export const courseRepository = new CourseRepository(generalConnection);
export const iWantToTrainRepository = new IWantToTrainRepository(generalConnection);
export const requestACourseRepository = new RequestACourseRepository(generalConnection);
export const businessTrainingRepository = new BusinessTrainingRepository(generalConnection);
export const faqRepository = new FAQRepository(generalConnection);
export const certificateRepository = new CertificateRepository(generalConnection);
