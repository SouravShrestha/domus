export type GuardInviteStatus = 'pending' | 'accepted' | 'cancelled';

export type GuardRole = 'gate' | 'patrol' | 'supervisor';

export type GuardInvite = {
  id: string;
  society_id: string;
  phone: string;
  name?: string | null;
  role: GuardRole;
  added_by?: string | null;
  status: GuardInviteStatus;
  invite_code: string;
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
  user_id: string;
  society_id: string;
  role: GuardRole;
  shift_start?: string | null;
  shift_end?: string | null;
  valid_from?: string | null;
  valid_till?: string | null;
  is_active: boolean;
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
