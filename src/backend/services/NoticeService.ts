import { NoticeRepository } from '../repositories/NoticeRepository.ts';
import { ApiError } from '../utils/ApiError.ts';

export class NoticeService {
  static async getNotices(limit = 20, offset = 0) {
    return NoticeRepository.getNotices(limit, offset);
  }

  static async getNoticeDetails(id: string) {
    const notice = await NoticeRepository.getNoticeById(id);
    if (!notice) throw ApiError.notFound('Notice not found');
    return notice;
  }

  static async getBanners() {
    return NoticeRepository.getBanners();
  }
}
