import { sendResponse } from '../../utils/response.util';
import { AppMessages } from '../../constants/messages';
import { Request, Response, NextFunction } from 'express';
import { ISeatAssignmentController } from '../interfaces/ISeatAssignmentController';
import { ISeatAssignmentService } from '../../services/interfaces/ISeatAssignmentService';
import { HttpStatus } from '../../constants/statusCodes';
import { IAuthenticatedRequest } from '../../types/auth.types';

export class SeatAssignmentController implements ISeatAssignmentController {
  constructor(private readonly assignmentService: ISeatAssignmentService) {}

  async assignSeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { candidateId, seatId } = req.body;
      const adminId = (req as IAuthenticatedRequest).user!.userId;

      const assignment = await this.assignmentService.assignSeat({ sessionId, candidateId, seatId, adminId });
      sendResponse(res, HttpStatus.CREATED, AppMessages.SEAT_ASSIGNED, assignment);
    } catch (error) {
      next(error);
    }
  }

  async getSessionAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const assignments = await this.assignmentService.getSessionAssignments(sessionId);
      sendResponse(res, HttpStatus.OK, AppMessages.ASSIGNMENTS_RETRIEVED, assignments);
    } catch (error) {
      next(error);
    }
  }

  async getAvailableSeats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const seats = await this.assignmentService.getAvailableSeats(sessionId);
      sendResponse(res, HttpStatus.OK, AppMessages.AVAILABLE_SEATS_RETRIEVED, seats);
    } catch (error) {
      next(error);
    }
  }

  async getCandidateAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId } = req.params;
      const assignments = await this.assignmentService.getCandidateAssignment(candidateId);
      sendResponse(res, HttpStatus.OK, AppMessages.CANDIDATE_ASSIGNMENT_HISTORY_RETRIEVED, assignments);
    } catch (error) {
      next(error);
    }
  }

  async reassignSeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { assignmentId } = req.params;
      const { newSeatId, reason } = req.body;
      const adminId = (req as IAuthenticatedRequest).user!.userId;

      const assignment = await this.assignmentService.reassignSeat({ assignmentId, newSeatId, reason, adminId });
      sendResponse(res, HttpStatus.OK, AppMessages.SEAT_REASSIGNED, assignment);
    } catch (error) {
      next(error);
    }
  }

  async moveSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { assignmentId } = req.params;
      const { newSessionId, newSeatId, reason } = req.body;
      const adminId = (req as IAuthenticatedRequest).user!.userId;

      const data = await this.assignmentService.moveSession({
        assignmentId,
        newSessionId,
        newSeatId,
        adminId,
        reason
      });

      sendResponse(res, HttpStatus.OK, AppMessages.CANDIDATE_MOVED, data);
    } catch (error) {
      next(error);
    }
  }

  async cancelAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { assignmentId } = req.params;
      const adminId = (req as IAuthenticatedRequest).user!.userId;

      const assignment = await this.assignmentService.cancelAssignment({ assignmentId, adminId });
      sendResponse(res, HttpStatus.OK, AppMessages.ASSIGNMENT_CANCELLED, assignment);
    } catch (error) {
      next(error);
    }
  }

  async autoAssignSeats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const adminId = (req as IAuthenticatedRequest).user!.userId;

      const result = await this.assignmentService.autoAssignSeats(sessionId, adminId);
      sendResponse(res, HttpStatus.OK, AppMessages.AUTO_ASSIGNMENT_COMPLETED, result);
    } catch (error) {
      next(error);
    }
  }
}
