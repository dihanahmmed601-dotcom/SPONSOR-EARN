import { Router } from 'express';
import { WithdrawalController } from '../controllers/WithdrawalController.ts';
import { authenticateJwt } from '../middlewares/authMiddleware.ts';
import { validateBody } from '../middlewares/validateMiddleware.ts';

const router = Router();

router.use(authenticateJwt);

router.post('/request', validateBody(['method', 'accountNumber', 'amount']), WithdrawalController.create);
router.get('/history', WithdrawalController.getHistory);
router.get('/status/:id', WithdrawalController.getStatus);

export default router;
