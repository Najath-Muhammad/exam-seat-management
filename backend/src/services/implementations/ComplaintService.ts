import { IComplaintService } from '../interfaces/IComplaintService';
import { IComplaintRepository } from '../../repositories/interfaces/IComplaintRepository';
import { IComplaint, ComplaintStatus } from '../../models/Complaint';
import { NotFoundError, BadRequestError } from '../../errors';

export class ComplaintService implements IComplaintService {
  constructor(private complaintRepository: IComplaintRepository) {}

  async registerComplaint(candidateId: string, sessionId: string, description: string): Promise<IComplaint> {
    if (!description) {
      throw new BadRequestError('Complaint description is required');
    }
    return this.complaintRepository.create({ candidateId: candidateId as any, sessionId: sessionId as any, description, status: ComplaintStatus.PENDING });
  }

  async getComplaintsBySession(sessionId: string): Promise<IComplaint[]> {
    return this.complaintRepository.findBySession(sessionId);
  }

  async getComplaintsByCandidate(candidateId: string): Promise<IComplaint[]> {
    return this.complaintRepository.findByCandidate(candidateId);
  }

  async getAllComplaints(): Promise<IComplaint[]> {
    return this.complaintRepository.findAll();
  }

  async updateComplaintStatus(id: string, status: string, remarks?: string): Promise<IComplaint> {
    if (!Object.values(ComplaintStatus).includes(status as ComplaintStatus)) {
      throw new BadRequestError('Invalid complaint status');
    }
    const updateData: Partial<IComplaint> = { status: status as ComplaintStatus };
    if (remarks) {
      updateData.resolutionRemarks = remarks;
    }
    const complaint = await this.complaintRepository.update(id, updateData);
    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }
    return complaint;
  }
}
