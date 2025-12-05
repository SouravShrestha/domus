import {
  ResidenceMembershipInvitation,
  ApprovedResidenceMembership,
  PendingResidenceMembership,
  RejectedResidenceMembershipInvitation,
} from "@models/residenceMembership";
import { InviteResponse } from "@/types/api/response/invite";
import { RepositoryResponse } from "./profile.interface";

export { RepositoryResponse };

export interface ResidenceMembershipInvitationWithDetails extends ResidenceMembershipInvitation {
  residence_short_name: string;
  society_name: string;
}

export interface IInvitationRepository {
  findActiveByPhoneAndResidence(
    userPhoneNumber: string,
    residenceId: string
  ): Promise<RepositoryResponse<Pick<ResidenceMembershipInvitation, "id">>>;

  findByInviteCode(
    inviteCode: string
  ): Promise<RepositoryResponse<Pick<ResidenceMembershipInvitation, "id">>>;

  findByIdAndPhoneNumber(
    invitationId: string,
    userPhoneNumber: string,
    status: string
  ): Promise<RepositoryResponse<ResidenceMembershipInvitationWithDetails>>;

  findByInviteCodeWithDetails(
    inviteCode: string,
    userPhoneNumber: string
  ): Promise<RepositoryResponse<InviteResponse>>;

  create(invitation: {
    user_phone_number: string;
    residence_id: string;
    role: string;
    status: string;
    auto_approve: boolean;
    invite_code: string;
    invited_by_user: string;
    invitee_name?: string;
  }): Promise<RepositoryResponse<ResidenceMembershipInvitation>>;

  updateStatus(
    invitationId: string,
    status: string
  ): Promise<RepositoryResponse<null>>;

  deleteInvitation(
    invitationId: string
  ): Promise<RepositoryResponse<null>>;
}

export interface IInvitationService {
  createResidenceInvite(
    userPhoneNumber: string,
    residenceId: string,
    role: string,
    invitedByUserId: string,
    autoApprove?: boolean,
    inviteeName?: string,
    residenceShortName?: string,
    societyName?: string
  ): Promise<RepositoryResponse<ResidenceMembershipInvitation>>;

  acceptResidenceInvitation(
    invitationId: string,
    userId: string,
    userPhoneNumber: string
  ): Promise<RepositoryResponse<ApprovedResidenceMembership | PendingResidenceMembership>>;

  rejectResidenceInvitation(
    invitationId: string,
    userPhoneNumber: string
  ): Promise<RepositoryResponse<RejectedResidenceMembershipInvitation>>;

  searchInviteCode(
    inviteCode: string,
    userPhoneNumber: string
  ): Promise<RepositoryResponse<InviteResponse>>;

  deleteInvitation(
    invitationId: string,
    deletedByUserId: string,
    residenceId: string,
    inviteeName?: string,
    inviteePhone?: string,
    role?: string,
    residenceShortName?: string,
    societyName?: string
  ): Promise<RepositoryResponse<null>>;
}
