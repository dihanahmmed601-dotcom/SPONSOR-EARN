import { TaskRepository } from '../repositories/TaskRepository.ts';
import { ApiError } from '../utils/ApiError.ts';

export class TaskService {
  static async getTaskList(limit = 20, offset = 0) {
    return TaskRepository.getTasks(limit, offset);
  }

  static async getTaskDetails(taskId: string) {
    const task = await TaskRepository.getById(taskId);
    if (!task) throw ApiError.notFound('Task not found');
    return task;
  }

  static async completeTask(taskId: string, userId: string, proofData?: string) {
    const task = await TaskRepository.getById(taskId);
    if (!task) throw ApiError.notFound('Task not found');

    const completion = await TaskRepository.completeTask(taskId, userId, Number(task.reward_amount), proofData);
    return completion;
  }

  static async getUserTaskHistory(userId: string, limit = 20, offset = 0) {
    return TaskRepository.getUserTaskHistory(userId, limit, offset);
  }
}
