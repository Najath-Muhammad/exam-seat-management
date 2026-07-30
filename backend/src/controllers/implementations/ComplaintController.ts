import { Request, Response, NextFunction } from 'express';
import { IComplaintController } from '../interfaces/IComplaintController';
import { IComplaintService } from '../../services/interfaces/IComplaintService';
import { sendResponse } from '../../utils/response.util';
import { HttpStatus } from '../../constants/statusCodes';
import { AppMessages } from '../../constants/messages';

export class ComplaintController implements IComplaintController {
  constructor(private complaintService: IComplaintService) {}

  async registerComplaint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId, sessionId, description } = req.body;
      const complaint = await this.complaintService.registerComplaint(candidateId, sessionId, description);
      sendResponse(res, HttpStatus.CREATED, 'Complaint registered successfully', complaint);
    } catch (error) {
      next(error);
    }
  }

  async getComplaintsBySession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const complaints = await this.complaintService.getComplaintsBySession(sessionId);
      sendResponse(res, HttpStatus.OK, AppMessages.SUCCESS, complaints);
    } catch (error) {
      next(error);
    }
  }

  async getAllComplaints(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const complaints = await this.complaintService.getAllComplaints();
      sendResponse(res, HttpStatus.OK, AppMessages.SUCCESS, complaints);
    } catch (error) {
      next(error);
    }
  }

  async updateComplaintStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;
      const complaint = await this.complaintService.updateComplaintStatus(id, status, remarks);
      sendResponse(res, HttpStatus.OK, 'Complaint status updated successfully', complaint);
    } catch (error) {
      next(error);
    }
  }
}
