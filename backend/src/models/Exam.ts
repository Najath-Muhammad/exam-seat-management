import { Schema, model, Document } from 'mongoose';

export interface IExam extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const ExamModel = model<IExam>('Exam', ExamSchema);
