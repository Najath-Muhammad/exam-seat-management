import mongoose from 'mongoose';
import { env } from './environment';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, 
    });
    
    mongoose.set('bufferCommands', false);
    console.log('[Database] MongoDB connected successfully.');
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected.');
});

mongoose.connection.on('error', (err: Error) => {
  console.error('[Database] MongoDB runtime error:', err.message);
});
