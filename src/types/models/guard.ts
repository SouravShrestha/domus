export type GuardInviteStatus = 'pending' | 'accepted';
export type GuardStatus = 'active' | 'inactive';

export type SocietyGuardInvite = {
  id: string;
  society_id: string;
  phone: string;
  name?: string | null;
  added_by?: string | null;
  status: GuardInviteStatus;
  created_at: string;
};

export type SocietyGuard = {
  id: string;
  user_id: string;
  society_id: string;
  invite_id?: string | null;
  status: GuardStatus;
  created_at: string;
};

export type SocietyGuardWithSociety = SocietyGuard & {
  society: {
    id: string;
    name: string;
    code: string;
    image_url?: string | null;
  };
};

