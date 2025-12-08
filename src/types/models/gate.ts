export type SocietyGate = {
  id: string;
  society_id: string;
  name: string;
  code: string;
  location?: string | null;
  is_active: boolean;
  created_at: string;
};

export type SocietyGateWithSociety = SocietyGate & {
  society: {
    id: string;
    name: string;
    code: string;
  };
};
