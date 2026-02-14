export type CabInviteStatus = 'scheduled' | 'active' | 'visited' | 'expired';

export interface CabInvite {
  id: string;
  residence_id: string;
  invited_by_user_id: string;
  cab_type: string;
  driver_name: string | null;
  vehicle_number: string | null;
  valid_from: string;
  valid_until: string;
  notes: string | null;
  status: CabInviteStatus;
  visited_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCabInviteParams {
  residence_id: string;
  invited_by_user_id: string;
  cab_type: string;
  driver_name?: string;
  vehicle_number?: string;
  valid_from: string;
  valid_until: string;
  notes?: string;
}

export interface UpdateCabInviteParams {
  id: string;
  cab_type: string;
  driver_name?: string;
  vehicle_number?: string;
  valid_from: string;
  valid_until: string;
  notes?: string;
}
