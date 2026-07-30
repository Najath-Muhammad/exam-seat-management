import { connectDatabase } from '../config/database';
import { ExamModel } from '../models/Exam';
import mongoose from 'mongoose';

const seedExam = async () => {
  await connectDatabase();

  try {
    const existing = await ExamModel.findOne({ name: 'MERN Developer Assessment' });
    if (!existing) {
      const exam = await ExamModel.create({
        name: 'MERN Developer Assessment',
        description: 'Comprehensive exam for Full-Stack Developers'
      });
      console.log(`Exam created with ID: ${exam._id}`);
    } else {
      console.log(`Exam already exists with ID: ${existing._id}`);
    }
  } catch (error) {
    console.error('Failed to seed exam:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

seedExam();
