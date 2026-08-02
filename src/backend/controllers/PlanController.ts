import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.ts';
import { PlanService } from '../services/PlanService.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';

export class PlanController {
  static async getPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await PlanService.getPlans();
      return ApiResponse.success(res, 'Plan list retrieved', plans);
    } catch (error) {
      next(error);
    }
  }

  static async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const plan = await PlanService.getPlanDetails(id);
      return ApiResponse.success(res, 'Plan details retrieved', plan);
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const currentPlan = await PlanService.getCurrentUserPlan(userId);
      return ApiResponse.success(res, 'Current user plan retrieved', currentPlan);
    } catch (error) {
      next(error);
    }
  }
}
