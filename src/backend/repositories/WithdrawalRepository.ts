import { db as sqlDb } from '../../db/index.ts';
import { sql } from 'drizzle-orm';

export class WithdrawalRepository {
  static async createRequest(data: {
    userId: string;
    method: string;
    accountNumber: string;
    amount: number;
    charge?: number;
    netAmount: number;
  }) {
    const charge = data.charge || 0;
    const res = await sqlDb.execute(
      sql`INSERT INTO withdrawal_requests (user_id, method, account_number, amount, charge, net_amount, status)
          VALUES (${data.userId}::uuid, ${data.method}, ${data.accountNumber}, ${data.amount}, ${charge}, ${data.netAmount}, 'pending')
          RETURNING *;`
    );
    return res.rows[0];
  }

  static async getHistoryByUserId(userId: string, limit = 20, offset = 0) {
    try {
      const res = await sqlDb.execute(
        sql`SELECT * FROM withdrawal_requests WHERE user_id = ${userId}::uuid ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset};`
      );
      return res.rows;
    } catch {
      return [];
    }
  }

  static async getById(id: string) {
    try {
      const res = await sqlDb.execute(sql`SELECT * FROM withdrawal_requests WHERE id = ${id}::uuid LIMIT 1;`);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  }
}
