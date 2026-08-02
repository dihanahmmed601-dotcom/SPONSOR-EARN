import { Router } from 'express';
import { PlanController } from '../controllers/PlanController.ts';
import { authenticateJwt } from '../middlewares/authMiddleware.ts';

const router = Router();

router.get('/list', PlanController.getPlans);
router.get('/details/:id', PlanController.getDetails);
router.get('/current', authenticateJwt, PlanController.getCurrentPlan);

export default router;
