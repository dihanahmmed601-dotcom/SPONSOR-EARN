import { db as sqlDb } from '../../db/index.ts';
import { sql } from 'drizzle-orm';

export class DepositRepository {
  static async createRequest(data: {
    userId: string;
    method: string;
    amount: number;
    fee?: number;
    netAmount: number;
    transactionId: string;
    userPhone: string;
    proofImage?: string;
  }) {
    const fee = data.fee || 0;
    const res = await sqlDb.execute(
      sql`INSERT INTO deposit_requests (user_id, method, amount, fee, net_amount, transaction_id, user_phone, proof_image, status)
          VALUES (${data.userId}::uuid, ${data.method}, ${data.amount}, ${fee}, ${data.netAmount}, ${data.transactionId}, ${data.userPhone}, ${data.proofImage || null}, 'pending')
          RETURNING *;`
    );
    return res.rows[0];
  }

  static async getHistoryByUserId(userId: string, limit = 20, offset = 0) {
    try {
      const res = await sqlDb.execute(
        sql`SELECT * FROM deposit_requests WHERE user_id = ${userId}::uuid ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset};`
      );
      return res.rows;
    } catch {
      return [];
    }
  }

  static async getById(id: string) {
    try {
      const res = await sqlDb.execute(sql`SELECT * FROM deposit_requests WHERE id = ${id}::uuid LIMIT 1;`);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  }
}
