export type Residence = {
  id: string;
  society_id: string;
  flat_number: string;
  block: string | null;
  floor_number: number | null;
  short_name: string;
  is_occupied: boolean;
  created_at: string;
};

