import { ICandidateRepository } from '../interfaces/ICandidateRepository';
import { CandidateModel, ICandidate } from '../../models/Candidate';
import { ClientSession } from 'mongoose';

export class CandidateRepository implements ICandidateRepository {
  async create(candidateData: Partial<ICandidate>): Promise<ICandidate> {
    const candidate = new CandidateModel(candidateData);
    return candidate.save();
  }

  async createMany(candidatesData: Partial<ICandidate>[]): Promise<ICandidate[]> {
    return CandidateModel.insertMany(candidatesData) as any;
  }

  async findById(id: string): Promise<ICandidate | null> {
    return CandidateModel.findById(id).exec();
  }

  async findByRegistrationNumber(regNum: string): Promise<ICandidate | null> {
    return CandidateModel.findOne({ registrationNumber: regNum }).exec();
  }

  async findBySessionId(sessionId: string, skip: number = 0, limit: number = 50): Promise<{ candidates: ICandidate[], total: number }> {
    const [candidates, total] = await Promise.all([
      CandidateModel.find({ sessionId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      CandidateModel.countDocuments({ sessionId }).exec()
    ]);
    return { candidates, total };
  }

  async update(id: string, updateData: Partial<ICandidate>, session?: ClientSession): Promise<ICandidate | null> {
    const query = CandidateModel.findByIdAndUpdate(id, updateData, { new: true });
    if (session) {
      query.session(session);
    }
    return query.exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await CandidateModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async countBySessionId(sessionId: string): Promise<number> {
    return CandidateModel.countDocuments({ sessionId }).exec();
  }

  async existsByRegistrationNumber(regNum: string): Promise<boolean> {
    const count = await CandidateModel.countDocuments({ registrationNumber: regNum }).exec();
    return count > 0;
  }
}
