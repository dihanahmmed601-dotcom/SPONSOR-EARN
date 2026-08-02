import { Router } from 'express';
import { ReferralController } from '../controllers/ReferralController.ts';
import { authenticateJwt } from '../middlewares/authMiddleware.ts';

const router = Router();

router.use(authenticateJwt);

router.get('/list', ReferralController.getReferralList);
router.get('/rewards', ReferralController.getRewards);
router.get('/stats', ReferralController.getStats);

export default router;
