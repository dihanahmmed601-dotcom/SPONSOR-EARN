import { db as sqlDb } from '../../db/index.ts';
import { sql } from 'drizzle-orm';

export class WalletRepository {
  static async getWalletByUserId(userId: string) {
    try {
      const res = await sqlDb.execute(sql`SELECT * FROM wallets WHERE user_id = ${userId}::uuid LIMIT 1;`);
      if (res.rows.length === 0) {
        // Auto initialize
        const created = await sqlDb.execute(sql`INSERT INTO wallets (user_id) VALUES (${userId}::uuid) RETURNING *;`);
        return created.rows[0];
      }
      return res.rows[0];
    } catch {
      return {
        user_id: userId,
        deposit_balance: '0.00',
        earned_balance: '0.00',
        bonus_balance: '0.00',
        security_balance: '0.00',
        total_withdrawn: '0.00',
        total_deposited: '0.00'
      };
    }
  }

  static async getTransactionsByUserId(userId: string, limit = 20, offset = 0) {
    try {
      const res = await sqlDb.execute(
        sql`SELECT * FROM wallet_transactions WHERE user_id = ${userId}::uuid ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset};`
      );
      return res.rows;
    } catch {
      return [];
    }
  }

  static async createTransaction(data: {
    walletId: string;
    userId: string;
    walletType: string;
    type: string;
    amount: number;
    title: string;
    description?: string;
  }) {
    const txId = `TX_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const res = await sqlDb.execute(
      sql`INSERT INTO wallet_transactions (wallet_id, user_id, wallet_type, type, amount, title, description, tx_id)
          VALUES (${data.walletId}::uuid, ${data.userId}::uuid, ${data.walletType}, ${data.type}, ${data.amount}, ${data.title}, ${data.description || null}, ${txId})
          RETURNING *;`
    );
    return res.rows[0];
  }
}
