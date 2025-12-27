import generalConnection from "../config/databases";
import courseRepository from "./course.repository";
import IWantToTrainRepository from "./iwanttotrain.repository";
import RequestACourseRepository from "./requestACourse.repository";
import BusinessTrainingRepository from "./businessTraining.repository";
import FAQRepository from "./faq.repository";
import CompanySpecificDataRepository from "./companySpecificData.repository";

export { courseRepository };
export const iWantToTrainRepository = new IWantToTrainRepository(
  generalConnection,
);
export const requestACourseRepository = new RequestACourseRepository(
  generalConnection,
);
export const businessTrainingRepository = new BusinessTrainingRepository(
  generalConnection,
);
export const faqRepository = new FAQRepository(generalConnection);
export const companySpecificDataRepository = new CompanySpecificDataRepository(
  generalConnection,
);
