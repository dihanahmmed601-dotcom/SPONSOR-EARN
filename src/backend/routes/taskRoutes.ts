import { Router } from 'express';
import { TaskController } from '../controllers/TaskController.ts';
import { authenticateJwt } from '../middlewares/authMiddleware.ts';

const router = Router();

router.get('/list', TaskController.getTasks);
router.get('/details/:id', TaskController.getDetails);
router.post('/complete/:id', authenticateJwt, TaskController.complete);
router.get('/history', authenticateJwt, TaskController.getHistory);

export default router;
