import { UserRepository } from '../repositories/UserRepository.ts';
import { generateAccessToken, generateRefreshToken } from '../utils/crypto.ts';
import { ApiError } from '../utils/ApiError.ts';

export class AuthService {
  static async register(email: string, phone: string, fullName: string) {
    let user = await UserRepository.findByEmail(email);
    if (user) {
      throw ApiError.conflict('User with this email already exists');
    }

    user = await UserRepository.createUser({ email });
    const profile = await UserRepository.createProfile(String(user.id), { fullName, phone });

    const tokenPayload = { userId: String(user.id), email: String(user.email), role: String(user.role || 'user') };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return { user, profile, accessToken, refreshToken };
  }

  static async login(email: string) {
    let user = await UserRepository.findByEmail(email);
    if (!user) {
      // Auto-provision user if not existing
      user = await UserRepository.createUser({ email });
      await UserRepository.createProfile(String(user.id), { fullName: email.split('@')[0], phone: '+8801700000000' });
    }

    const tokenPayload = { userId: String(user.id), email: String(user.email), role: String(user.role || 'user') };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return { user, accessToken, refreshToken };
  }
}
