import mongoose, { Schema, Document } from 'mongoose';
import { HistoryAction } from '../types/assignmentHistory.types';

export interface IAssignmentHistory extends Document {
  candidateId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  oldSessionId?: mongoose.Types.ObjectId;
  newSessionId?: mongoose.Types.ObjectId;
  oldSeatId?: mongoose.Types.ObjectId;
  newSeatId?: mongoose.Types.ObjectId;
  action: HistoryAction;
  reason?: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentHistorySchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    oldSessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    newSessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    oldSeatId: { type: Schema.Types.ObjectId, ref: 'Seat' },
    newSeatId: { type: Schema.Types.ObjectId, ref: 'Seat' },
    action: {
      type: String,
      enum: Object.values(HistoryAction),
      required: true,
    },
    reason: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

assignmentHistorySchema.index({ candidateId: 1, createdAt: -1 });
assignmentHistorySchema.index({ examId: 1, sessionId: 1, createdAt: -1 });

export default mongoose.model<IAssignmentHistory>('AssignmentHistory', assignmentHistorySchema);
