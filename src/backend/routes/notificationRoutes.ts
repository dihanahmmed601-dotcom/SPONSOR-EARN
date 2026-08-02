import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController.ts';
import { authenticateJwt } from '../middlewares/authMiddleware.ts';

const router = Router();

router.use(authenticateJwt);

router.get('/list', NotificationController.getNotifications);
router.put('/read/:id', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);

export default router;
