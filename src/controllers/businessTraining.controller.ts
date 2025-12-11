import { NextFunction, Request, Response } from 'express';
import prepareResponse from '../utils/api-response';
import BusinessTrainingService from '../services/businessTraining.service';

export default class BusinessTrainingController {
  constructor(private readonly businessTrainingService: BusinessTrainingService) {}

  createBusinessTraining = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businessTrainingData = req.body;

      const newBusinessTraining = await this.businessTrainingService.create(businessTrainingData);
      return res.status(201).json(prepareResponse(201, 'BusinessTraining created successfully', newBusinessTraining));
    } catch (error) {
      return next(error);
    }
  };
}