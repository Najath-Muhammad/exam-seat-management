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
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Seat map retrieved successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecoveryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const data = await this.seatMapService.getRecoveryStatus(sessionId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Recovery status retrieved successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  }
}
