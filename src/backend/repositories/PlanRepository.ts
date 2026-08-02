import { db as sqlDb } from '../../db/index.ts';
import { sql } from 'drizzle-orm';

export class PlanRepository {
  static async getPlans() {
    try {
      const res = await sqlDb.execute(sql`SELECT * FROM plans WHERE status = 'published' ORDER BY price ASC;`);
      return res.rows;
    } catch {
      return [];
    }
  }

  static async getById(planId: string) {
    try {
      const res = await sqlDb.execute(sql`SELECT * FROM plans WHERE id = ${planId}::uuid LIMIT 1;`);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  }

  static async getUserCurrentPlan(userId: string) {
    try {
      const res = await sqlDb.execute(
        sql`SELECT ph.*, p.name as plan_name, p.tier_name, p.daily_task_limit, p.daily_earning_limit
            FROM plan_histories ph 
            JOIN plans p ON ph.plan_id = p.id 
            WHERE ph.user_id = ${userId}::uuid AND ph.status = 'active' 
            ORDER BY ph.starts_at DESC LIMIT 1;`
      );
      return res.rows[0] || null;
    } catch {
      return null;
    }
  }
}
