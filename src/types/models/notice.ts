export enum NoticeCategory {
  General = "general",
  Maintenance = "maintenance",
  Event = "event",
  Emergency = "emergency",
  Administrative = "administrative",
}

export enum NoticePriority {
  Normal = "normal",
  Important = "important",
  Urgent = "urgent",
}

export enum NoticeVisibility {
  All = "all",
  OwnersOnly = "owners_only",
  SecurityGuards = "security_guards",
}

export enum NoticeStatus {
  Draft = "draft",
  Published = "published",
  Archived = "archived",
}

export interface NoticeAudience {
  visibility: NoticeVisibility;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  priority: NoticePriority;
  audience: NoticeAudience;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  status: NoticeStatus;
}

export interface CreateNoticeInput {
  title: string;
  description: string;
  category: NoticeCategory;
  priority: NoticePriority;
  audience: NoticeAudience;
}
