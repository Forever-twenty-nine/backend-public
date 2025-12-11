import { NextFunction, Request, Response } from 'express';
import prepareResponse from '../utils/api-response';
import RequestACourseService from '../services/requestACourse.service';

export default class RequestACourseController {
  constructor(private readonly requestACourseService: RequestACourseService) {}

  createRequestACourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestACourseData = req.body;

      const newRequestACourse = await this.requestACourseService.create(requestACourseData);
      return res.status(201).json(prepareResponse(201, 'RequestACourse created successfully', newRequestACourse));
    } catch (error) {
      return next(error);
    }
  };
}