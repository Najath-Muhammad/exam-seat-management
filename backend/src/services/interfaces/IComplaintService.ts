import { IComplaint } from '../../models/Complaint';

export interface IComplaintService {
  registerComplaint(candidateId: string, sessionId: string, description: string): Promise<IComplaint>;
  getComplaintsBySession(sessionId: string): Promise<IComplaint[]>;
  getComplaintsByCandidate(candidateId: string): Promise<IComplaint[]>;
  getAllComplaints(): Promise<IComplaint[]>;
  updateComplaintStatus(id: string, status: string, remarks?: string): Promise<IComplaint>;
}
