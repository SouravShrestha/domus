export enum ActivityType {
  INVITE_SENT = 'INVITE_SENT',
  INVITE_ACCEPTED = 'INVITE_ACCEPTED',
  INVITE_REJECTED = 'INVITE_REJECTED',
  INVITE_DELETED = 'INVITE_DELETED',
  MEMBER_JOINED = 'MEMBER_JOINED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  MEMBER_ROLE_UPDATED = 'MEMBER_ROLE_UPDATED',
}

export interface ActivityLogMetadata {
  role?: string;
  previous_status?: string;
  new_status?: string;
  invite_code?: string;
  [key: string]: any;
}

export interface ActivityLog {
  id: string;
  created_at: string;
  residence_id: string;
  actor_user_id: string | null;
  action_type: ActivityType;
  target_identifier: string | null;
  metadata: ActivityLogMetadata;
}

export interface ActivityLogWithActor extends ActivityLog {
  actor?: {
    id: string;
    name: string;
    phone: string;
    avatar_url?: string;
  } | null;
}


