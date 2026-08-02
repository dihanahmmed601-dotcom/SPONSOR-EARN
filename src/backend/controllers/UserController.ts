import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.ts';
import { UserService } from '../services/UserService.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await UserService.getProfile(userId);
      return ApiResponse.success(res, 'User profile retrieved', profile);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const updated = await UserService.updateProfile(userId, req.body);
      return ApiResponse.success(res, 'Profile updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }
}
