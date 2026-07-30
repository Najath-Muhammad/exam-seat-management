import { Request, Response, NextFunction } from 'express';

export interface ISeatAssignmentController {
  assignSeat(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSessionAssignments(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAvailableSeats(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCandidateAssignment(req: Request, res: Response, next: NextFunction): Promise<void>;
  reassignSeat(req: Request, res: Response, next: NextFunction): Promise<void>;
  moveSession(req: Request, res: Response, next: NextFunction): Promise<void>;
  cancelAssignment(req: Request, res: Response, next: NextFunction): Promise<void>;
  autoAssignSeats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
