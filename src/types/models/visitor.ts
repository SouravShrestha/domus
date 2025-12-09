export type GuestInvitationStatus = "active" | "used" | "expired" | "cancelled";

export type EntryMethod = "qr_scan" | "manual_code" | "approved_by_guard";

export type ExitMethod =
  | "qr_scan"
  | "manual_code"
  | "auto_timeout"
  | "marked_by_guard";

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

// Walk-in visitor types
export type WalkInApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "not_required";

export interface WalkInVisitorLog {
  id: string;
  residence_id: string;
  visitor_name: string;
  visitor_phone: string | null;
  purpose: string | null;
  vehicle_number: string | null;
  entry_time: string;
  exit_time: string | null;
  entry_method: "approved_by_guard";
  exit_method: "manual_code" | "marked_by_guard" | null;
  entry_gate: string | null;
  exit_gate: string | null;
  recorded_by_guard_id: string;
  approval_status: WalkInApprovalStatus;
  approved_by_resident_user_id: string | null;
  guard_notes: string | null;
  temp_pass_code: string | null;
  temp_pass_valid_until: string | null;
  created_at: string;
}

export interface WalkInVisitorLogWithDetails extends WalkInVisitorLog {
  residence?: {
    id: string;
    short_name: string;
    flat_number: string;
    block: string | null;
    society: {
      id: string;
      name: string;
    };
  };
  recorded_by_guard?: {
    id: string;
    user_id: string;
    user: {
      id: string;
      name: string;
      phone: string;
    };
  };
  approved_by_resident?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface CreateWalkInEntryParams {
  residence_id: string;
  visitor_name: string;
  visitor_phone?: string;
  purpose?: string;
  vehicle_number?: string;
  recorded_by_guard_id: string;
  entry_gate?: string;
  approval_status: WalkInApprovalStatus;
  approved_by_resident_user_id?: string;
  guard_notes?: string;
}
