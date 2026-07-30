import { Request, Response, NextFunction } from 'express';

export interface IComplaintController {
  registerComplaint(req: Request, res: Response, next: NextFunction): Promise<void>;
  getComplaintsBySession(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllComplaints(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateComplaintStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
