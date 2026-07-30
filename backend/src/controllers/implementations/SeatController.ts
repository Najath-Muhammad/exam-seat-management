import { AppMessages } from '../../constants/messages';
import { Request, Response, NextFunction } from 'express';
import { ISeatController } from '../interfaces/ISeatController';
import { ISeatService } from '../../services/interfaces/ISeatService';
import { HttpStatus } from '../../constants/statusCodes';

export class SeatController implements ISeatController {
  constructor(private readonly seatService: ISeatService) {}

  async createSeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const seat = await this.seatService.createSeat(req.body);
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: AppMessages.SEAT_CREATED,
        data: seat
      });
    } catch (error) {
      next(error);
    }
  }

  async getSeats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;
      
      const query: any = {};
      if (req.query.status) query.status = req.query.status;
      if (req.query.row) query.row = req.query.row;

      const result = await this.seatService.getSeats(skip, limit, query);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.SEATS_RETRIEVED,
        data: {
          seats: result.seats,
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getSeatById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seatId } = req.params;
      const seat = await this.seatService.getSeatById(seatId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.SEAT_RETRIEVED,
        data: seat
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seatId } = req.params;
      const seat = await this.seatService.updateSeat(seatId, req.body);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.SEAT_UPDATED,
        data: seat
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seatId } = req.params;
      await this.seatService.deleteSeat(seatId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.SEAT_DELETED
      });
    } catch (error) {
      next(error);
    }
  }

  async generateSeats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.seatService.generateSeats(req.body);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.SEAT_GENERATION_PROCESSED,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
