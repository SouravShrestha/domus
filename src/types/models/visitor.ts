export type GuestInvitationStatus = 'active' | 'used' | 'expired' | 'cancelled';

export type EntryMethod = 'qr_scan' | 'manual_code' | 'approved_by_guard';

export type ExitMethod = 'qr_scan' | 'manual_code' | 'auto_timeout' | 'marked_by_guard';

export interface GuestInvitation {
  id: string;
  residence_id: string;
  invited_by_user_id: string;
  visitor_name: string;
  visitor_phone: string;
  purpose: string | null;
  pass_code: string;
  valid_from: string;
  valid_until: string;
  visits_allowed: number;
  visits_used: number;
  status: GuestInvitationStatus;
  vehicle_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuestInvitationWithDetails extends GuestInvitation {
  invited_by?: {
    id: string;
    name: string;
    phone: string;
    photo_url?: string;
  };
  residence?: {
    id: string;
    short_name: string;
    flat_number: string;
    block: string | null;
    society: {
      id: string;
      name: string;
      address: {
        street: string;
        city: string;
        state: string;
        zip_code: string;
      };
    };
  };
}

export interface GuestLog {
  id: string;
  guest_invitation_id: string;
  residence_id: string;
  entry_time: string;
  exit_time: string | null;
  entry_method: EntryMethod;
  entry_gate: string | null;
  exit_method: ExitMethod | null;
  exit_gate: string | null;
  guard_notes: string | null;
  created_at: string;
}

export interface GuestLogWithInvitation extends GuestLog {
  guest_invitation: GuestInvitation;
}

export interface CreateGuestInvitationParams {
  residence_id: string;
  invited_by_user_id: string;
  visitor_name: string;
  visitor_phone: string;
  purpose?: string;
  valid_from: string;
  valid_until: string;
  visits_allowed?: number;
  vehicle_number?: string;
  notes?: string;
}
