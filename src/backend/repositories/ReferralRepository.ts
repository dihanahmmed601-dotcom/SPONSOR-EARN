import { db as sqlDb } from '../../db/index.ts';
import { sql } from 'drizzle-orm';

export class ReferralRepository {
  static async getReferralsByReferrerId(referrerId: string, limit = 20, offset = 0) {
    try {
      const res = await sqlDb.execute(
        sql`SELECT ru.*, u.email as referred_email 
            FROM referral_users ru 
            JOIN users u ON ru.referred_id = u.id 
            WHERE ru.referrer_id = ${referrerId}::uuid 
            ORDER BY ru.created_at DESC 
            LIMIT ${limit} OFFSET ${offset};`
      );
      return res.rows;
    } catch {
      return [];
    }
  }

  static async getReferralRewards(userId: string, limit = 20, offset = 0) {
    try {
      const res = await sqlDb.execute(
        sql`SELECT * FROM referral_rewards WHERE referrer_id = ${userId}::uuid ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset};`
      );
      return res.rows;
    } catch {
      return [];
    }
  }

  static async getReferralStats(userId: string) {
    try {
      const countRes = await sqlDb.execute(
        sql`SELECT COUNT(*)::int as total_referrals FROM referral_users WHERE referrer_id = ${userId}::uuid;`
      );
      const rewardRes = await sqlDb.execute(
        sql`SELECT COALESCE(SUM(commission_amount), 0)::numeric as total_earned FROM referral_rewards WHERE referrer_id = ${userId}::uuid;`
      );
      return {
        totalReferrals: countRes.rows[0]?.total_referrals || 0,
        totalEarned: rewardRes.rows[0]?.total_earned || 0
      };
    } catch {
      return { totalReferrals: 0, totalEarned: 0 };
    }
  }
}
