import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { UserModel } from '../models/User';
import { hashPassword } from '../utils/password';
import { UserRole } from '../types/auth.types';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedAdmin = async () => {
  try {
    const adminName = process.env.ADMIN_NAME;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminName) {
      console.error('Error: Missing ADMIN_NAME environment variable');
      process.exit(1);
    }
    
    if (!adminEmail) {
      console.error('Error: Missing ADMIN_EMAIL environment variable');
      process.exit(1);
    }
    
    if (!adminPassword) {
      console.error('Error: Missing ADMIN_PASSWORD environment variable');
      process.exit(1);
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      console.error('Error: Invalid email format provided for ADMIN_EMAIL');
      process.exit(1);
    }

    
    if (adminPassword.length < 8) {
      console.error('Error: Weak password provided for ADMIN_PASSWORD (minimum 8 characters required)');
      process.exit(1);
    }

    
    await connectDatabase();

    
    const existingAdmin = await UserModel.findOne({ role: UserRole.ADMIN });
    
    if (existingAdmin) {
      console.log('Admin already exists. No duplicate Admin will be created.');
      process.exit(0);
    }

    
    const emailExists = await UserModel.findOne({ email: adminEmail });
    if (emailExists) {
      console.error(`Error: Email ${adminEmail} is already registered as a non-admin user. Cannot convert normal user to Admin.`);
      process.exit(1);
    }

    
    const passwordHash = await hashPassword(adminPassword);

    
    await UserModel.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true
    });

    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Error during Admin seeding:', error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

seedAdmin();
