export type ApprovedResidenceMembership = {
  id: string;
  user_id: string;
  residence_id: string;
  role: string;
  created_at: string;
};

export type ResidenceMembershipRequest = {
  id: string;
  user_id: string;
  residence_id: string;
  role: string;
  status?: string; // e.g., 'pending', 'approved', 'rejected'
  created_at: string;
  updated_at?: string;
};

export type ResidenceMembershipInvitation = {
  id: string;
  user_phone_number: string;
  residence_id: string;
  role: string;
  status: "invited" | "accepted" | "rejected";
  auto_approve: boolean;
  invite_code: string;
  created_at: string;
  updated_at: string;
};

export type PendingResidenceMembership = {
  id: string;
  user_id: string;
  residence_id: string;
  role: string;
  status: "pending" | "verified" | "approved";
  invitation_id: string | null;
  created_at: string;
  updated_at: string;
};

export type RejectedResidenceMembershipInvitation = {
  id: string;
  user_phone_number: string;
  residence_id: string;
  role: string;
  invitation_id: string | null;
  rejected_at: string;
  created_at: string;
  updated_at: string;
};

export type MembershipStatusHistory = {
  id: string;
  membership_id: string;
  status: 'requested' | 'verified' | 'approved' | 'rejected';
  status_set_at: string;
  changed_by_user_id?: string | null;
  notes?: string | null;
  created_at: string;
};

export type RevokedResidenceMembership = {
  id: string;
  user_id: string;
  residence_id: string;
  role: string;
  original_status: string;
  invitation_id?: string | null;
  revoked_at: string;
  revocation_reason?: string | null;
  created_at: string;
  updated_at: string;
};
