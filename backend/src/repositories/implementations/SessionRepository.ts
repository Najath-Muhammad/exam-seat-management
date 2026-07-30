import { ISessionRepository } from '../interfaces/ISessionRepository';
import { SessionModel, ISession } from '../../models/Session';

export class SessionRepository implements ISessionRepository {
  async create(sessionData: Partial<ISession>): Promise<ISession> {
    const session = new SessionModel(sessionData);
    return session.save();
  }

  async findById(id: string): Promise<ISession | null> {
    return SessionModel.findById(id).exec();
  }

  async findByExamId(examId: string): Promise<ISession[]> {
    return SessionModel.find({ examId }).sort({ startAt: 1 }).exec();
  }

  async findByExamIdAndNumber(examId: string, sessionNumber: number): Promise<ISession | null> {
    return SessionModel.findOne({ examId, sessionNumber }).exec();
  }

  async findOverlappingSessions(examId: string, startAt: Date, endAt: Date): Promise<ISession[]> {
    return SessionModel.find({
      examId,
      $or: [
        { startAt: { $lt: endAt }, endAt: { $gt: startAt } }
      ]
    }).exec();
  }

  async update(id: string, updateData: Partial<ISession>): Promise<ISession | null> {
    return SessionModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await SessionModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
