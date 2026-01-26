import { NoticeCategory, NoticePriority, NoticeAudience, NoticeStatus } from "@/types/models/notice";

export interface Notice {
  id: string;
  society_id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  priority: NoticePriority;
  audience: NoticeAudience;
  status: NoticeStatus;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}
