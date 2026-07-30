import { connectDatabase } from '../config/database';
import { UserModel } from '../models/User';
import { hashPassword } from '../utils/password';
import { UserRole } from '../types/auth.types';
import mongoose from 'mongoose';

const initAdmin = async () => {
  await connectDatabase();

  try {
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'securepassword';

    const existingAdmin = await UserModel.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists.');
    } else {
      const passwordHash = await hashPassword(adminPassword);
      await UserModel.create({
        name: 'System Administrator',
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
      });
      console.log(`Admin user created: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Failed to create admin:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

initAdmin();
