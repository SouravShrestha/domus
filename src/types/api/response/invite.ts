// Base invite response type
export type InviteResponse = {
  id: string;
  code: string;
  residenceShortName: string;
  societyName: string;
  invitedByUserName: string;
  used: boolean;
  expiresAt?: string;
  residentRole?: string;
  // Visitor invite specific fields
  expectedCheckInTime?: string;
  expectedCheckOutTime?: string;
  visitPurpose?: string;
};

export function isResidenceInvite(invite: InviteResponse): boolean {
  return !invite.expectedCheckInTime && !invite.expectedCheckOutTime;
}

export function isVisitorInvite(invite: InviteResponse): boolean {
  return !!invite.expectedCheckInTime || !!invite.expectedCheckOutTime;
}

