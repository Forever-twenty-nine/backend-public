import UserController from './user.controller';
import CourseController from './course.controller';
import FileController from './file.controller';
import IWantToTrainController from './iwanttotrain.controller';
import RequestACourseController from './requestACourse.controller';
import BusinessTrainingController from './businessTraining.controller';
import FAQController from './faq.controller';
import CertificateController from './certificate.controller';
import PromotionalCodeController from './promotionalCode.controller';

import {
  userService,
  courseService,
  fileService,
  iWantToTrainService,
  requestACourseService,
  businessTrainingService,
  faqService,
  certificateService,
  promotionalCodeService,
} from '@/services';

export const userController = new UserController(userService);
export const courseController = new CourseController(courseService);
export const fileController = new FileController(fileService);
export const iWantToTrainController = new IWantToTrainController(iWantToTrainService);
export const requestACourseController = new RequestACourseController(requestACourseService);
export const businessTrainingController = new BusinessTrainingController(businessTrainingService);
export const faqController = new FAQController(faqService);
export const certificateController = new CertificateController(certificateService);
export const promotionalCodeController = new PromotionalCodeController(promotionalCodeService);
