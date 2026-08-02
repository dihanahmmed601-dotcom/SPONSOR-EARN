import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.ts';
import { ReferralService } from '../services/ReferralService.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { getPaginationParams } from '../utils/pagination.ts';

export class ReferralController {
  static async getReferralList(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { limit, offset, page } = getPaginationParams(req);
      const referrals = await ReferralService.getReferralList(userId, limit, offset);
      return ApiResponse.success(res, 'Referral list retrieved', referrals, { page, limit });
    } catch (error) {
      next(error);
    }
  }

  static async getRewards(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { limit, offset, page } = getPaginationParams(req);
      const rewards = await ReferralService.getReferralRewards(userId, limit, offset);
      return ApiResponse.success(res, 'Referral rewards retrieved', rewards, { page, limit });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const stats = await ReferralService.getReferralStats(userId);
      return ApiResponse.success(res, 'Referral statistics retrieved', stats);
    } catch (error) {
      next(error);
    }
  }
}
