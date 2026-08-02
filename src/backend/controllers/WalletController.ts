import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.ts';
import { WalletService } from '../services/WalletService.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { getPaginationParams } from '../utils/pagination.ts';

export class WalletController {
  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const summary = await WalletService.getSummary(userId);
      return ApiResponse.success(res, 'Wallet summary retrieved', summary);
    } catch (error) {
      next(error);
    }
  }

  static async getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { limit, offset, page } = getPaginationParams(req);
      const transactions = await WalletService.getTransactions(userId, limit, offset);
      return ApiResponse.success(res, 'Transactions retrieved', transactions, { page, limit });
    } catch (error) {
      next(error);
    }
  }
}
