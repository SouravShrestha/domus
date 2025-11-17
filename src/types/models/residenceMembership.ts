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
