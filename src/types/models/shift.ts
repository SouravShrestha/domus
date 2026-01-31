export type SocietyShift = {
  id: string;
  society_id: string;
  name: string;
  start_time?: string | null;
  end_time?: string | null;
  is_active: boolean;
  created_at: string;
};

export type SocietyShiftWithSociety = SocietyShift & {
  society: {
    id: string;
    name: string;
    code: string;
  };
};
