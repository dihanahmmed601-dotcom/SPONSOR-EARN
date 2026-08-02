import { db as sqlDb } from '../../db/index.ts';
import { sql } from 'drizzle-orm';

export class UserRepository {
  static async findByEmail(email: string) {
    try {
      const res = await sqlDb.execute(sql`SELECT * FROM users WHERE email = ${email} LIMIT 1;`);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  }

  static async findById(id: string) {
    try {
      const res = await sqlDb.execute(sql`SELECT * FROM users WHERE id = ${id}::uuid LIMIT 1;`);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  }

  static async findProfileByUserId(userId: string) {
    try {
      const res = await sqlDb.execute(sql`SELECT * FROM user_profiles WHERE user_id = ${userId}::uuid LIMIT 1;`);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  }

  static async createUser(data: { firebaseUid?: string; email: string; role?: string }) {
    const role = data.role || 'user';
    const uid = data.firebaseUid || `user_${Date.now()}`;
    const res = await sqlDb.execute(
      sql`INSERT INTO users (firebase_uid, email, role) VALUES (${uid}, ${data.email}, ${role}) RETURNING *;`
    );
    return res.rows[0];
  }

  static async createProfile(userId: string, data: { fullName: string; phone: string }) {
    const res = await sqlDb.execute(
      sql`INSERT INTO user_profiles (user_id, full_name, phone) VALUES (${userId}::uuid, ${data.fullName}, ${data.phone}) RETURNING *;`
    );
    return res.rows[0];
  }

  static async updateProfile(userId: string, data: Partial<{ fullName: string; phone: string; avatarUrl: string; country: string; bio: string }>) {
    const res = await sqlDb.execute(
      sql`UPDATE user_profiles 
          SET full_name = COALESCE(${data.fullName || null}, full_name),
              phone = COALESCE(${data.phone || null}, phone),
              avatar_url = COALESCE(${data.avatarUrl || null}, avatar_url),
              country = COALESCE(${data.country || null}, country),
              bio = COALESCE(${data.bio || null}, bio),
              updated_at = NOW()
          WHERE user_id = ${userId}::uuid
          RETURNING *;`
    );
    return res.rows[0];
  }
}
