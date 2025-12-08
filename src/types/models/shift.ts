export type SocietyShift = {
  id: string;
  society_id: string;
  name: string;
  start_time: string;
  end_time: string;
  description?: string | null;
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
