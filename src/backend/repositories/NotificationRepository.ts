import { db as sqlDb } from '../../db/index.ts';
import { sql } from 'drizzle-orm';

export class NotificationRepository {
  static async getUserNotifications(userId: string, limit = 20, offset = 0) {
    try {
      const res = await sqlDb.execute(
        sql`SELECT * FROM notifications WHERE user_id = ${userId}::uuid ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset};`
      );
      return res.rows;
    } catch {
      return [];
    }
  }

  static async markAsRead(notificationId: string, userId: string) {
    const res = await sqlDb.execute(
      sql`UPDATE notifications SET is_read = true WHERE id = ${notificationId}::uuid AND user_id = ${userId}::uuid RETURNING *;`
    );
    return res.rows[0];
  }

  static async deleteNotification(notificationId: string, userId: string) {
    await sqlDb.execute(
      sql`DELETE FROM notifications WHERE id = ${notificationId}::uuid AND user_id = ${userId}::uuid;`
    );
    return true;
  }
}
