import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.ts';
import { TaskService } from '../services/TaskService.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { getPaginationParams } from '../utils/pagination.ts';

export class TaskController {
  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset, page } = getPaginationParams(req);
      const tasks = await TaskService.getTaskList(limit, offset);
      return ApiResponse.success(res, 'Task list retrieved', tasks, { page, limit });
    } catch (error) {
      next(error);
    }
  }

  static async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await TaskService.getTaskDetails(id);
      return ApiResponse.success(res, 'Task details retrieved', task);
    } catch (error) {
      next(error);
    }
  }

  static async complete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { proofData } = req.body;
      const completion = await TaskService.completeTask(id, userId, proofData);
      return ApiResponse.success(res, 'Task completed successfully', completion);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { limit, offset, page } = getPaginationParams(req);
      const history = await TaskService.getUserTaskHistory(userId, limit, offset);
      return ApiResponse.success(res, 'User task history retrieved', history, { page, limit });
    } catch (error) {
      next(error);
    }
  }
}
