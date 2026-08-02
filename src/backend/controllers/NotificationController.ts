import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.ts';
import { NotificationService } from '../services/NotificationService.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { getPaginationParams } from '../utils/pagination.ts';

export class NotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { limit, offset, page } = getPaginationParams(req);
      const notifications = await NotificationService.getUserNotifications(userId, limit, offset);
      return ApiResponse.success(res, 'Notifications retrieved', notifications, { page, limit });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const updated = await NotificationService.markAsRead(id, userId);
      return ApiResponse.success(res, 'Notification marked as read', updated);
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      await NotificationService.deleteNotification(id, userId);
      return ApiResponse.success(res, 'Notification deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }
}
