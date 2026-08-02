import { Router } from 'express';
import { NoticeController } from '../controllers/NoticeController.ts';

const router = Router();

router.get('/list', NoticeController.getNotices);
router.get('/details/:id', NoticeController.getDetails);
router.get('/banners', NoticeController.getBanners);

export default router;
