export type ManagerInviteStatus = 'pending' | 'accepted';

export type SocietyManagerInvite = {
  id: string;
  society_id: string;
  phone: string;
  name?: string | null;
  role: string;
  added_by?: string | null;
  status: ManagerInviteStatus;
  created_at: string;
};

export type ManagerProfile = {
  id: string;
  user_id: string;
  society_id: string;
  invite_id?: string | null;
  created_at: string;
};

// Alias for backward compatibility
export type SocietyManager = ManagerProfile;

export type SocietyManagerWithSociety = SocietyManager & {
  society: {
    id: string;
    name: string;
    code: string;
    image_url?: string | null;
  };
};

