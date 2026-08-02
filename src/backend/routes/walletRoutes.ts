import { Router } from 'express';
import { WalletController } from '../controllers/WalletController.ts';
import { authenticateJwt } from '../middlewares/authMiddleware.ts';

const router = Router();

router.use(authenticateJwt);

router.get('/summary', WalletController.getSummary);
router.get('/transactions', WalletController.getTransactions);

export default router;
