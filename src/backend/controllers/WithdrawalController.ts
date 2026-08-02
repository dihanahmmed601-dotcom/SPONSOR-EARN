import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.ts';
import { WithdrawalService } from '../services/WithdrawalService.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { getPaginationParams } from '../utils/pagination.ts';

export class WithdrawalController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const withdrawal = await WithdrawalService.createRequest(userId, req.body);
      return ApiResponse.created(res, 'Withdrawal request created successfully', withdrawal);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { limit, offset, page } = getPaginationParams(req);
      const history = await WithdrawalService.getHistory(userId, limit, offset);
      return ApiResponse.success(res, 'Withdrawal history retrieved', history, { page, limit });
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const status = await WithdrawalService.getStatus(id);
      return ApiResponse.success(res, 'Withdrawal status retrieved', status);
    } catch (error) {
      next(error);
    }
  }
}
