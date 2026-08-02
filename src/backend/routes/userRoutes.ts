import { Router } from 'express';
import { UserController } from '../controllers/UserController.ts';
import { authenticateJwt } from '../middlewares/authMiddleware.ts';

const router = Router();

router.use(authenticateJwt);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

export default router;
