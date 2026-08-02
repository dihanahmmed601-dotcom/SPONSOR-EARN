import { Request, Response, NextFunction } from 'express';
import { NoticeService } from '../services/NoticeService.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { getPaginationParams } from '../utils/pagination.ts';

export class NoticeController {
  static async getNotices(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset, page } = getPaginationParams(req);
      const notices = await NoticeService.getNotices(limit, offset);
      return ApiResponse.success(res, 'Notice list retrieved', notices, { page, limit });
    } catch (error) {
      next(error);
    }
  }

  static async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notice = await NoticeService.getNoticeDetails(id);
      return ApiResponse.success(res, 'Notice details retrieved', notice);
    } catch (error) {
      next(error);
    }
  }

  static async getBanners(req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await NoticeService.getBanners();
      return ApiResponse.success(res, 'Banner list retrieved', banners);
    } catch (error) {
      next(error);
    }
  }
}
