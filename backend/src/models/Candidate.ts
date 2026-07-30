import { Schema, model, Document, Types } from 'mongoose';
import { CandidateStatus } from '../types/candidate.types';

export interface ICandidate extends Document {
  registrationNumber: string;
  name: string;
  email?: string;
  phone?: string;
  sessionId: Types.ObjectId;
  status: CandidateStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    registrationNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    status: { 
      type: String, 
      enum: Object.values(CandidateStatus), 
      default: CandidateStatus.REGISTERED 
    },
  },
  { timestamps: true }
);

export const CandidateModel = model<ICandidate>('Candidate', CandidateSchema);
