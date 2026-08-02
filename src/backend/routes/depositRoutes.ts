import { Router } from 'express';
import { DepositController } from '../controllers/DepositController.ts';
import { authenticateJwt } from '../middlewares/authMiddleware.ts';
import { validateBody } from '../middlewares/validateMiddleware.ts';

const router = Router();

router.use(authenticateJwt);

router.post('/request', validateBody(['method', 'amount', 'transactionId', 'userPhone']), DepositController.create);
router.get('/history', DepositController.getHistory);
router.get('/status/:id', DepositController.getStatus);

export default router;
