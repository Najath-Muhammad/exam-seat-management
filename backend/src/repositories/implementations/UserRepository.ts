import { IUserRepository } from '../interfaces/IUserRepository';
import { UserModel, IUser } from '../../models/User';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).exec();
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return user.save();
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }
}
