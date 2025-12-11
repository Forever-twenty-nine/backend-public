import UserService from './user.service';
import CourseService from './course.service';
import FileService from './file.service';
import IWantToTrainService from './iwanttotrain.service';
import RequestACourseService from './requestACourse.service';
import BusinessTrainingService from './businessTraining.service';
import FAQService from './faq.service';
import CertificateService from './certificate.service';
import PromotionalCodeService from './promotionalCode.service';
import BunnyCdnService from './bunnyCdn.service';

import {
  userRepository,
  courseRepository,
  iWantToTrainRepository,
  requestACourseRepository,
  businessTrainingRepository,
  faqRepository,
  certificateRepository,
} from '@/repositories';

export const userService = new UserService(userRepository, courseRepository);
export const courseService = new CourseService(courseRepository, userRepository);
export const iWantToTrainService = new IWantToTrainService(iWantToTrainRepository);
export const requestACourseService = new RequestACourseService(requestACourseRepository);
export const businessTrainingService = new BusinessTrainingService(businessTrainingRepository);
export const faqService = new FAQService(faqRepository);
export const certificateService = new CertificateService(userRepository, courseRepository, certificateRepository);
export const promotionalCodeService = new PromotionalCodeService();
export const bunnyCdnService = new BunnyCdnService();
export const fileService = new FileService();
