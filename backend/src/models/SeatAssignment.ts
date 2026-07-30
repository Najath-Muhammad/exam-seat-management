import { Schema, model, Document, Types } from 'mongoose';
import { AssignmentStatus } from '../types/seatAssignment.types';

export interface ISeatAssignment extends Document {
  candidateId: Types.ObjectId;
  sessionId: Types.ObjectId;
  seatId: Types.ObjectId;
  assignmentNumber: string;
  status: AssignmentStatus;
  assignedAt: Date;
  assignedBy: Types.ObjectId;
  reassignedAt?: Date;
  reassignedBy?: Types.ObjectId;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SeatAssignmentSchema = new Schema<ISeatAssignment>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    seatId: { type: Schema.Types.ObjectId, ref: 'Seat', required: true },
    assignmentNumber: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(AssignmentStatus),
      default: AssignmentStatus.ASSIGNED,
    },
    assignedAt: { type: Date, default: Date.now },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reassignedAt: { type: Date },
    reassignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String },
  },
  { timestamps: true }
);

// Enforce unique active assignments per candidate per session
SeatAssignmentSchema.index(
  { sessionId: 1, candidateId: 1 },
  { unique: true, partialFilterExpression: { status: AssignmentStatus.ASSIGNED } }
);

// Enforce unique active assignments per seat per session
SeatAssignmentSchema.index(
  { sessionId: 1, seatId: 1 },
  { unique: true, partialFilterExpression: { status: AssignmentStatus.ASSIGNED } }
);

export const SeatAssignmentModel = model<ISeatAssignment>('SeatAssignment', SeatAssignmentSchema);
