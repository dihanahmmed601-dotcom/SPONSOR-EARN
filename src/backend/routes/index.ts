import { Router } from 'express';
import authRoutes from './authRoutes.ts';
import userRoutes from './userRoutes.ts';
import walletRoutes from './walletRoutes.ts';
import depositRoutes from './depositRoutes.ts';
import withdrawRoutes from './withdrawRoutes.ts';
import taskRoutes from './taskRoutes.ts';
import referralRoutes from './referralRoutes.ts';
import planRoutes from './planRoutes.ts';
import noticeRoutes from './noticeRoutes.ts';
import notificationRoutes from './notificationRoutes.ts';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wallets', walletRoutes);
router.use('/deposits', depositRoutes);
router.use('/withdrawals', withdrawRoutes);
router.use('/tasks', taskRoutes);
router.use('/referrals', referralRoutes);
router.use('/plans', planRoutes);
router.use('/notices', noticeRoutes);
router.use('/notifications', notificationRoutes);

export default router;
