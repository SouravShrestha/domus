export enum ActivityType {
  INVITE_SENT = "INVITE_SENT",
  INVITE_ACCEPTED = "INVITE_ACCEPTED",
  INVITE_REJECTED = "INVITE_REJECTED",
  INVITE_DELETED = "INVITE_DELETED",
  MEMBER_JOINED = "MEMBER_JOINED",
  MEMBER_REMOVED = "MEMBER_REMOVED",
  MEMBER_ROLE_UPDATED = "MEMBER_ROLE_UPDATED",
  MEMBER_PERMISSIONS_UPDATED = "MEMBER_PERMISSIONS_UPDATED",
  GUEST_INVITED = "GUEST_INVITED",
  GUEST_INVITATION_CANCELLED = "GUEST_INVITATION_CANCELLED",
  GUEST_INVITATION_DELETED = "GUEST_INVITATION_DELETED",
  GUARD_INVITED = "GUARD_INVITED",
  GUARD_REMOVED = "GUARD_REMOVED",
  GUARD_STATUS_UPDATED = "GUARD_STATUS_UPDATED",
  WALK_IN_VISITOR_ENTRY = "WALK_IN_VISITOR_ENTRY",
  WALK_IN_VISITOR_APPROVAL_REQUESTED = "WALK_IN_VISITOR_APPROVAL_REQUESTED",
  WALK_IN_VISITOR_APPROVED = "WALK_IN_VISITOR_APPROVED",
  WALK_IN_VISITOR_REJECTED = "WALK_IN_VISITOR_REJECTED",
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
