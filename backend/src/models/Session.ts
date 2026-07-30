import { Schema, model, Document, Types } from 'mongoose';
import { SessionStatus } from '../types/session.types';

export interface ISession extends Document {
  examId: Types.ObjectId;
  sessionNumber: number;
  name?: string;
  startAt: Date;
  endAt: Date;
  status: SessionStatus;
  capacity: number;
  isCandidatesFinalized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    sessionNumber: { type: Number, required: true },
    name: { type: String },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    status: { 
      type: String, 
      enum: Object.values(SessionStatus), 
      default: SessionStatus.DRAFT 
    },
    capacity: { type: Number, default: 50 },
    isCandidatesFinalized: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SessionSchema.index({ examId: 1, sessionNumber: 1 }, { unique: true });

export const SessionModel = model<ISession>('Session', SessionSchema);
