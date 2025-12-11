import { NextFunction, Request, Response } from 'express';
import prepareResponse from '../utils/api-response';
import IWantToTrainService from '../services/iwanttotrain.service';

export default class IWantToTrainController {
  constructor(private readonly iWantToTrainService: IWantToTrainService) {}

  /**
   * Creates a new IWantToTrain entry
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  createIWantToTrain = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const iWantToTrainData = req.body;

      const newIWantToTrain = await this.iWantToTrainService.create(iWantToTrainData);
      return res.status(201).json(prepareResponse(201, 'IWantToTrain created successfully', newIWantToTrain));
    } catch (error) {
      return next(error);
    }
  };
}