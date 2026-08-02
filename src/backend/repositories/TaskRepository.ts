import { db as sqlDb } from '../../db/index.ts';
import { sql } from 'drizzle-orm';

export class TaskRepository {
  static async getTasks(limit = 20, offset = 0) {
    try {
      const res = await sqlDb.execute(
        sql`SELECT * FROM tasks WHERE status = 'active' ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset};`
      );
      return res.rows;
    } catch {
      return [];
    }
  }

  static async getById(taskId: string) {
    try {
      const res = await sqlDb.execute(sql`SELECT * FROM tasks WHERE id = ${taskId}::uuid LIMIT 1;`);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  }

  static async completeTask(taskId: string, userId: string, rewardEarned: number, proofData?: string) {
    const res = await sqlDb.execute(
      sql`INSERT INTO task_completions (task_id, user_id, reward_earned, proof_data, status)
          VALUES (${taskId}::uuid, ${userId}::uuid, ${rewardEarned}, ${proofData || null}, 'approved')
          RETURNING *;`
    );
    // Increment completion count
    await sqlDb.execute(
      sql`UPDATE tasks SET completed_users_count = completed_users_count + 1 WHERE id = ${taskId}::uuid;`
    );
    return res.rows[0];
  }

  static async getUserTaskHistory(userId: string, limit = 20, offset = 0) {
    try {
      const res = await sqlDb.execute(
        sql`SELECT tc.*, t.title as task_title, t.sponsor_name 
            FROM task_completions tc 
            JOIN tasks t ON tc.task_id = t.id 
            WHERE tc.user_id = ${userId}::uuid 
            ORDER BY tc.completed_at DESC 
            LIMIT ${limit} OFFSET ${offset};`
      );
      return res.rows;
    } catch {
      return [];
    }
  }
}
