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
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Seat assigned successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const assignments = await this.assignmentService.getSessionAssignments(sessionId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Assignments retrieved successfully',
        data: assignments
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableSeats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const seats = await this.assignmentService.getAvailableSeats(sessionId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Available seats retrieved successfully',
        data: seats
      });
    } catch (error) {
      next(error);
    }
  }

  async getCandidateAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId } = req.params;
      const assignments = await this.assignmentService.getCandidateAssignment(candidateId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Candidate assignment history retrieved successfully',
        data: assignments
      });
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
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Seat reassigned successfully',
        data: assignment
      });
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

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Candidate moved to new session successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { assignmentId } = req.params;
      const adminId = (req as IAuthenticatedRequest).user!.userId;

      const assignment = await this.assignmentService.cancelAssignment({ assignmentId, adminId });
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Assignment cancelled successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  async autoAssignSeats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const adminId = (req as IAuthenticatedRequest).user!.userId;

      const result = await this.assignmentService.autoAssignSeats(sessionId, adminId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Auto assignment completed',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
