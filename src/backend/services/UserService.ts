import { UserRepository } from '../repositories/UserRepository.ts';
import { ApiError } from '../utils/ApiError.ts';

export class UserService {
  static async getProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    const profile = await UserRepository.findProfileByUserId(userId);
    return { ...user, profile };
  }

  static async updateProfile(userId: string, data: any) {
    const updatedProfile = await UserRepository.updateProfile(userId, data);
    return updatedProfile;
  }
}
