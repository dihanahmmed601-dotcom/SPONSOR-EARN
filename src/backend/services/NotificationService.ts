import { NotificationRepository } from '../repositories/NotificationRepository.ts';

export class NotificationService {
  static async getUserNotifications(userId: string, limit = 20, offset = 0) {
    return NotificationRepository.getUserNotifications(userId, limit, offset);
  }

  static async markAsRead(notificationId: string, userId: string) {
    return NotificationRepository.markAsRead(notificationId, userId);
  }

  static async deleteNotification(notificationId: string, userId: string) {
    return NotificationRepository.deleteNotification(notificationId, userId);
  }
}
