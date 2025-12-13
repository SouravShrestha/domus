import { noticeRepository, NoticeRepository } from "@/api/repositories/notice/notice.repository";

export class NoticeService {
  constructor(private readonly repo: NoticeRepository) {}

  async getSocietyNotices(societyId: string) {
    return this.repo.findBySocietyId(societyId);
  }
}

export const noticeService = new NoticeService(noticeRepository);

export const getSocietyNotices = (societyId: string) =>
  noticeService.getSocietyNotices(societyId);
