import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.ts';
import { DepositService } from '../services/DepositService.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { getPaginationParams } from '../utils/pagination.ts';

export class DepositController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const deposit = await DepositService.createRequest(userId, req.body);
      return ApiResponse.created(res, 'Deposit request created successfully', deposit);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { limit, offset, page } = getPaginationParams(req);
      const history = await DepositService.getHistory(userId, limit, offset);
      return ApiResponse.success(res, 'Deposit history retrieved', history, { page, limit });
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const status = await DepositService.getStatus(id);
      return ApiResponse.success(res, 'Deposit status retrieved', status);
    } catch (error) {
      next(error);
    }
  }
}
