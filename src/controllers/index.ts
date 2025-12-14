import CourseController from './course.controller';
import IWantToTrainController from './iwanttotrain.controller';
import RequestACourseController from './requestACourse.controller';
import BusinessTrainingController from './businessTraining.controller';
import FAQController from './faq.controller';

import {
  courseService,
  iWantToTrainService,
  requestACourseService,
  businessTrainingService,
  faqService,
} from '@/services';
export const courseController = new CourseController(courseService);
export const iWantToTrainController = new IWantToTrainController(iWantToTrainService);
export const requestACourseController = new RequestACourseController(requestACourseService);
export const businessTrainingController = new BusinessTrainingController(businessTrainingService);
export const faqController = new FAQController(faqService);
