import mongoose, { Document, Schema } from 'mongoose';

export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

export interface IComplaint extends Document {
  candidateId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  description: string;
  status: ComplaintStatus;
  resolutionRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'ExamSession', required: true },
    description: { type: String, required: true },
    status: { type: String, enum: Object.values(ComplaintStatus), default: ComplaintStatus.PENDING },
    resolutionRemarks: { type: String }
  },
  { timestamps: true }
);

export const ComplaintModel = mongoose.model<IComplaint>('Complaint', complaintSchema);
