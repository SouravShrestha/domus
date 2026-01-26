import { noticeRepository, NoticeRepository } from "@/api/repositories/notice/notice.repository";
import { CreateNoticeInput } from "@/types/models/notice";

export class NoticeService {
  constructor(private readonly repo: NoticeRepository) {}

  async getSocietyNotices(societyId: string) {
    return this.repo.findBySocietyId(societyId);
  }

  async createNotice(societyId: string, userId: string, input: CreateNoticeInput) {
    return this.repo.createNotice(societyId, userId, input);
  }

  async updateNotice(noticeId: string, input: Partial<CreateNoticeInput>) {
    return this.repo.updateNotice(noticeId, input);
  }

  async deleteNotice(noticeId: string) {
    return this.repo.deleteNotice(noticeId);
  }
}

export const noticeService = new NoticeService(noticeRepository);

export const getSocietyNotices = (societyId: string) =>
  noticeService.getSocietyNotices(societyId);

export const createNotice = (societyId: string, userId: string, input: CreateNoticeInput) =>
  noticeService.createNotice(societyId, userId, input);

export const updateNotice = (noticeId: string, input: Partial<CreateNoticeInput>) =>
  noticeService.updateNotice(noticeId, input);

export const deleteNotice = (noticeId: string) =>
  noticeService.deleteNotice(noticeId);
