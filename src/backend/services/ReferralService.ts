import { ReferralRepository } from '../repositories/ReferralRepository.ts';

export class ReferralService {
  static async getReferralList(userId: string, limit = 20, offset = 0) {
    return ReferralRepository.getReferralsByReferrerId(userId, limit, offset);
  }

  static async getReferralRewards(userId: string, limit = 20, offset = 0) {
    return ReferralRepository.getReferralRewards(userId, limit, offset);
  }

  static async getReferralStats(userId: string) {
    return ReferralRepository.getReferralStats(userId);
  }
}
