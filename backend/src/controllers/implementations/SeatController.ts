import { sendResponse } from '../../utils/response.util';
import { AppMessages } from '../../constants/messages';
import { Request, Response, NextFunction } from 'express';
import { ISeatController } from '../interfaces/ISeatController';
import { ISeatService } from '../../services/interfaces/ISeatService';
import { HttpStatus } from '../../constants/statusCodes';import { TAny } from '../../types/any';


export class SeatController implements ISeatController {
  constructor(private readonly seatService: ISeatService) {}

  async createSeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const seat = await this.seatService.createSeat(req.body);
      sendResponse(res, HttpStatus.CREATED, AppMessages.SEAT_CREATED, seat);
    } catch (error) {
      next(error);
    }
  }

  async getSeats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;
      
      const query: TAny = {};
      if (req.query.status) query.status = req.query.status;
      if (req.query.row) query.row = req.query.row;

      const result = await this.seatService.getSeats(skip, limit, query);
      sendResponse(res, HttpStatus.OK, AppMessages.SEATS_RETRIEVED, {
          seats: result.seats,
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        });
    } catch (error) {
      next(error);
    }
  }

  async getSeatById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seatId } = req.params;
      const seat = await this.seatService.getSeatById(seatId);
      sendResponse(res, HttpStatus.OK, AppMessages.SEAT_RETRIEVED, seat);
    } catch (error) {
      next(error);
    }
  }

  async updateSeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seatId } = req.params;
      const seat = await this.seatService.updateSeat(seatId, req.body);
      sendResponse(res, HttpStatus.OK, AppMessages.SEAT_UPDATED, seat);
    } catch (error) {
      next(error);
    }
  }

  async deleteSeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seatId } = req.params;
      await this.seatService.deleteSeat(seatId);
      sendResponse(res, HttpStatus.OK, AppMessages.SEAT_DELETED);
    } catch (error) {
      next(error);
    }
  }

  async generateSeats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.seatService.generateSeats(req.body);
      sendResponse(res, HttpStatus.OK, AppMessages.SEAT_GENERATION_PROCESSED, result);
    } catch (error) {
      next(error);
    }
  }
}
