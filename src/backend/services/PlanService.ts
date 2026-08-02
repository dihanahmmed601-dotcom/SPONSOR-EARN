import { PlanRepository } from '../repositories/PlanRepository.ts';
import { ApiError } from '../utils/ApiError.ts';

export class PlanService {
  static async getPlans() {
    return PlanRepository.getPlans();
  }

  static async getPlanDetails(planId: string) {
    const plan = await PlanRepository.getById(planId);
    if (!plan) throw ApiError.notFound('Plan not found');
    return plan;
  }

  static async getCurrentUserPlan(userId: string) {
    return PlanRepository.getUserCurrentPlan(userId);
  }
}
