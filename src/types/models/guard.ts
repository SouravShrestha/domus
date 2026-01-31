export type GuardInviteStatus = 'pending' | 'accepted' | 'cancelled';

export type GuardRole = 'gate' | 'patrol' | 'supervisor';

export type GuardProfileStatus = 'pending' | 'active' | 'disabled';

export type GuardAssignmentStatus =
  | 'scheduled'
  | 'active'
  | 'completed'
  | 'cancelled';

export type GuardInvite = {
  id: string;
  society_id: string;
  phone: string;
  name?: string | null;
  role: GuardRole;
  added_by?: string | null;
  status: GuardInviteStatus;
  invite_code: string;
  accepted_user_id?: string | null;
  accepted_at?: string | null;
  created_at: string;
};

export type GuardInviteWithSociety = GuardInvite & {
  society: {
    id: string;
    name: string;
    code: string;
    image_url?: string | null;
  };
};

export type GuardProfile = {
  id: string;
  user_id: string;
  society_id: string;
  role: GuardRole;
  status: GuardProfileStatus;
  invite_id?: string | null;
  created_at: string;
};

export type GuardProfileWithSociety = GuardProfile & {
  society: {
    id: string;
    name: string;
    code: string;
    image_url?: string | null;
  };
};

export type GuardAssignment = {
  id: string;
  guard_profile_id: string;
  society_id: string;
  gate_ids: string[];
  shift_id?: string | null;
  shift_start: string;
  shift_end: string;
  allow_anytime_access: boolean;
  created_at: string;
};

export type GuardAssignmentWithSociety = GuardAssignment & {
  society: {
    id: string;
    name: string;
    code: string;
    image_url?: string | null;
  };
};
