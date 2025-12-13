import CourseService from './course.service';
import IWantToTrainService from './iwanttotrain.service';
import RequestACourseService from './requestACourse.service';
import BusinessTrainingService from './businessTraining.service';
import FAQService from './faq.service';
import BunnyCdnService from './bunnyCdn.service';

import {
  courseRepository,
  iWantToTrainRepository,
  requestACourseRepository,
  businessTrainingRepository,
  faqRepository,
} from '@/repositories';

export const courseService = new CourseService();
export const iWantToTrainService = new IWantToTrainService(iWantToTrainRepository);
export const requestACourseService = new RequestACourseService(requestACourseRepository);
export const businessTrainingService = new BusinessTrainingService(businessTrainingRepository);
export const faqService = new FAQService(faqRepository);
export const bunnyCdnService = new BunnyCdnService();
