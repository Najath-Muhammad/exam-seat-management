import { Request, Response, NextFunction } from 'express';

export interface ISeatController {
  createSeat(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSeats(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSeatById(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateSeat(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteSeat(req: Request, res: Response, next: NextFunction): Promise<void>;
  generateSeats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
