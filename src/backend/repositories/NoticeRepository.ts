import { db as sqlDb } from '../../db/index.ts';
import { sql } from 'drizzle-orm';

export class NoticeRepository {
  static async getNotices(limit = 20, offset = 0) {
    try {
      const res = await sqlDb.execute(
        sql`SELECT * FROM notices WHERE is_published = true ORDER BY is_pinned DESC, published_at DESC LIMIT ${limit} OFFSET ${offset};`
      );
      return res.rows;
    } catch {
      return [];
    }
  }

  static async getNoticeById(id: string) {
    try {
      const res = await sqlDb.execute(sql`SELECT * FROM notices WHERE id = ${id}::uuid LIMIT 1;`);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  }

  static async getBanners() {
    try {
      const res = await sqlDb.execute(
        sql`SELECT * FROM banners WHERE is_active = true ORDER BY priority ASC, created_at DESC;`
      );
      return res.rows;
    } catch {
      return [];
    }
  }
}
