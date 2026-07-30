import { ISeatAssignmentRepository } from '../interfaces/ISeatAssignmentRepository';
import { SeatAssignmentModel, ISeatAssignment } from '../../models/SeatAssignment';
import { AssignmentStatus } from '../../types/seatAssignment.types';
import { ClientSession } from 'mongoose';import { TAny } from '../../types/any';


export class SeatAssignmentRepository implements ISeatAssignmentRepository {
  async create(data: Partial<ISeatAssignment>, session?: ClientSession): Promise<ISeatAssignment> {
    const assignments = await SeatAssignmentModel.create([data], { session });
    return assignments[0];
  }

  async createMany(data: Partial<ISeatAssignment>[], session?: ClientSession): Promise<ISeatAssignment[]> {
    return SeatAssignmentModel.insertMany(data, { session }) as TAny;
  }

  async findById(id: string): Promise<ISeatAssignment | null> {
    return SeatAssignmentModel.findById(id).populate('candidateId').populate('seatId').exec();
  }

  async findActiveByCandidateAndSession(candidateId: string, sessionId: string): Promise<ISeatAssignment | null> {
    return SeatAssignmentModel.findOne({
      candidateId,
      sessionId,
      status: AssignmentStatus.ASSIGNED
    }).exec();
  }

  async findActiveBySeatAndSession(seatId: string, sessionId: string): Promise<ISeatAssignment | null> {
    return SeatAssignmentModel.findOne({
      seatId,
      sessionId,
      status: AssignmentStatus.ASSIGNED
    }).exec();
  }

  async findBySessionId(sessionId: string): Promise<ISeatAssignment[]> {
    return SeatAssignmentModel.find({ sessionId })
      .populate('candidateId')
      .populate('seatId')
      .populate('assignedBy', 'name email')
      .sort({ assignedAt: -1 })
      .exec();
  }

  async findByCandidateId(candidateId: string): Promise<ISeatAssignment[]> {
    return SeatAssignmentModel.find({ candidateId })
      .populate('seatId')
      .populate('sessionId')
      .populate('assignedBy', 'name email')
      .sort({ assignedAt: -1 })
      .exec();
  }

  async update(id: string, updateData: Partial<ISeatAssignment>, session?: ClientSession): Promise<ISeatAssignment | null> {
    const options: TAny = { new: true };
    if (session) options.session = session;
    return SeatAssignmentModel.findByIdAndUpdate(id, updateData, options).exec() as TAny;
  }

  async updateMany(query: TAny, updateData: TAny, session?: ClientSession): Promise<TAny> {
    const options: TAny = {};
    if (session) options.session = session;
    return SeatAssignmentModel.updateMany(query, updateData, options).exec();
  }
}
