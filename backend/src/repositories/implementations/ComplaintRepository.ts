import { IComplaintRepository } from '../interfaces/IComplaintRepository';
import { ComplaintModel, IComplaint } from '../../models/Complaint';

export class ComplaintRepository implements IComplaintRepository {
  async create(data: Partial<IComplaint>): Promise<IComplaint> {
    const complaint = new ComplaintModel(data);
    return complaint.save();
  }

  async findById(id: string): Promise<IComplaint | null> {
    return ComplaintModel.findById(id).populate('candidateId').populate('sessionId').exec();
  }

  async findByCandidate(candidateId: string): Promise<IComplaint[]> {
    return ComplaintModel.find({ candidateId }).populate('sessionId').sort({ createdAt: -1 }).exec();
  }

  async findBySession(sessionId: string): Promise<IComplaint[]> {
    return ComplaintModel.find({ sessionId }).populate('candidateId').sort({ createdAt: -1 }).exec();
  }

  async findAll(): Promise<IComplaint[]> {
    return ComplaintModel.find().populate('candidateId').populate('sessionId').sort({ createdAt: -1 }).exec();
  }

  async update(id: string, data: Partial<IComplaint>): Promise<IComplaint | null> {
    return ComplaintModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
