import { sendResponse } from '../../utils/response.util';
import { AppMessages } from '../../constants/messages';
import { Request, Response, NextFunction } from 'express';
import { ISeatMapController } from '../interfaces/ISeatMapController';
import { ISeatMapService } from '../../services/interfaces/ISeatMapService';
import { HttpStatus } from '../../constants/statusCodes';

export class SeatMapController implements ISeatMapController {
  constructor(private readonly seatMapService: ISeatMapService) {}

  async getSeatMap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const data = await this.seatMapService.getSeatMap(sessionId);
      sendResponse(res, HttpStatus.OK, AppMessages.SEAT_MAP_RETRIEVED, data);
    } catch (error) {
      next(error);
    }
  }

  async getRecoveryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const data = await this.seatMapService.getRecoveryStatus(sessionId);
      sendResponse(res, HttpStatus.OK, AppMessages.RECOVERY_STATUS_RETRIEVED, data);
    } catch (error) {
      next(error);
    }
  }
}
