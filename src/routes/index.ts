import { Router } from 'express';
import { logger } from '../utils';

// Importar todas las rutas directamente
import coursesRoute from './courses.route';
import businessTrainingRoute from './businessTraining.route';
import faqsRoute from './faqs.route';
import iwanttotrainRoute from './iwanttotrain.route';
import publicRoute from './public.route';
import requestACourseRoute from './requestACourse.route';

interface RouteConfig {
  router: Router;
  prefix: string;
}

export default async function registerRoutes() {
  const routes: RouteConfig[] = [
    { router: coursesRoute, prefix: 'courses' },
    { router: businessTrainingRoute, prefix: 'businessTraining' },
    { router: faqsRoute, prefix: 'faqs' },
    { router: iwanttotrainRoute, prefix: 'iwanttotrain' },
    { router: publicRoute, prefix: 'public' },
    { router: requestACourseRoute, prefix: 'requestACourse' },
  ];

  const routers: Router[] = [];

  for (const { router, prefix } of routes) {
    const wrappedRouter = Router();
    wrappedRouter.use(`/${prefix}`, router);
    routers.push(wrappedRouter);
    logger.info(`📍 Registered route: /${prefix}`);
  }

  return routers;
}
