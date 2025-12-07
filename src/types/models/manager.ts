export type ManagerInviteStatus = 'pending' | 'accepted';
export type ManagerRole = 'manager' | 'admin';

export type SocietyManagerInvite = {
  id: string;
  society_id: string;
  phone: string;
  name?: string | null;
  role: ManagerRole;
  added_by?: string | null;
  status: ManagerInviteStatus;
  created_at: string;
};

export type SocietyManager = {
  id: string;
  user_id: string;
  society_id: string;
  invite_id?: string | null;
  role: ManagerRole;
  created_at: string;
};

export type SocietyManagerWithSociety = SocietyManager & {
  society: {
    id: string;
    name: string;
    code: string;
    image_url?: string | null;
  };
};

