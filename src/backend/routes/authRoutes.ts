import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.ts';
import { validateBody } from '../middlewares/validateMiddleware.ts';

const router = Router();

router.post('/register', validateBody(['email', 'phone', 'fullName']), AuthController.register);
router.post('/login', validateBody(['email']), AuthController.login);
router.post('/logout', AuthController.logout);

export default router;
