import {
  ResidenceMembershipInvitation,
  ApprovedResidenceMembership,
  PendingResidenceMembership,
  RejectedResidenceMembershipInvitation,
} from "@models/residenceMembership";
import { InviteResponse } from "@/types/api/response/invite";
import { invitationRepository } from "@repositories/invitation/invitation.repository";
import { rejectedInvitationRepository } from "@repositories/invitation/rejectedInvitation.repository";
import { approvedMembershipRepository } from "@repositories/membership/approvedMembership.repository";
import { pendingMembershipRepository } from "@repositories/membership/pendingMembership.repository";
import {
  IInvitationRepository,
  IInvitationService,
  RepositoryResponse,
} from "@interfaces/invitation.interface";
import { IRejectedInvitationRepository } from "@interfaces/rejectedInvitation.interface";
import { IApprovedMembershipRepository } from "@interfaces/approvedMembership.interface";
import { IPendingMembershipRepository } from "@interfaces/pendingMembership.interface";
import {
  InvitationAlreadyExistsError,
  MembershipAlreadyExistsError,
  InviteCodeGenerationError,
  InvitationNotFoundError,
  InvalidInviteCodeError,
} from "../errors/invitation.errors";
import { IMembershipStatusHistoryRepository } from "../interfaces/membershipStatusHistory.interface";
import { membershipStatusHistoryRepository } from "../repositories/membership/membershipStatusHistory.repository";

const DEFAULT_STATUS = "invited";
const ACCEPTED_STATUS = "accepted";
const REJECTED_STATUS = "rejected";
const PENDING_STATUS = "pending";
const APPROVED_STATUS = "approved";
const MAX_CODE_GENERATION_ATTEMPTS = 10;

export class InvitationService implements IInvitationService {
  constructor(
    private readonly invitationRepo: IInvitationRepository,
    private readonly rejectedInvitationRepo: IRejectedInvitationRepository,
    private readonly approvedMembershipRepo: IApprovedMembershipRepository,
    private readonly pendingMembershipRepo: IPendingMembershipRepository,
    private readonly membershipStatusHistoryRepo: IMembershipStatusHistoryRepository
  ) {}

  async createResidenceInvite(
    userPhoneNumber: string,
    residenceId: string,
    role: string,
    invitedByUserId: string,
    autoApprove: boolean = false
  ): Promise<RepositoryResponse<ResidenceMembershipInvitation>> {
    // Check if an active invitation already exists
    const { data: existingInvitation } =
      await this.invitationRepo.findActiveByPhoneAndResidence(
        userPhoneNumber,
        residenceId
      );

    if (existingInvitation) {
      throw new InvitationAlreadyExistsError();
    }

    // Generate unique invite code
    const inviteCode = await this.generateUniqueInviteCode();

    // Create the invitation
    return this.invitationRepo.create({
      user_phone_number: userPhoneNumber,
      residence_id: residenceId,
      role,
      status: DEFAULT_STATUS,
      auto_approve: autoApprove,
      invite_code: inviteCode,
      invited_by_user: invitedByUserId,
    });
  }

  async acceptResidenceInvitation(
    invitationId: string,
    userId: string,
    userPhoneNumber: string
  ): Promise<
    RepositoryResponse<ApprovedResidenceMembership | PendingResidenceMembership>
  > {
    // Fetch the invitation and validate it belongs to the user
    const { data: invitation, error: fetchError } =
      await this.invitationRepo.findByIdAndPhoneNumber(
        invitationId,
        userPhoneNumber,
        DEFAULT_STATUS
      );

    if (fetchError || !invitation) {
      throw new InvitationNotFoundError(invitationId);
    }

    // Check if user is already a member of this residence
    const { data: existingMembership } =
      await this.approvedMembershipRepo.findByUserIdAndResidence(
        userId,
        invitation.residence_id
      );

    if (existingMembership) {
      throw new MembershipAlreadyExistsError();
    }

    // Update invitation status to accepted
    const { error: updateError } = await this.invitationRepo.updateStatus(
      invitationId,
      ACCEPTED_STATUS
    );

    if (updateError) {
      return { data: null, error: updateError };
    }

    let response: any;
    // Create membership based on auto_approve setting
    if (invitation.auto_approve) {
      response = await this.approvedMembershipRepo.create({
        user_id: userId,
        residence_id: invitation.residence_id,
        role: invitation.role,
      });
    } else {
      response = await this.pendingMembershipRepo.create({
        user_id: userId,
        residence_id: invitation.residence_id,
        role: invitation.role,
        status: PENDING_STATUS,
        invitation_id: invitationId,
      });
      const { error: historyError } = await this.membershipStatusHistoryRepo
        .create({
          pending_membership_id: response.data?.id,
          status: "pending",
          changed_by: userId,
          notes: "Invitation accepted by user",
        });

      if (historyError) {
        console.error("Failed to create status history:", historyError);
      }
    }
    return response;
  }

  async rejectResidenceInvitation(
    invitationId: string,
    userPhoneNumber: string
  ): Promise<RepositoryResponse<RejectedResidenceMembershipInvitation>> {
    // Fetch the invitation and validate it belongs to the user
    const { data: invitation, error: fetchError } =
      await this.invitationRepo.findByIdAndPhoneNumber(
        invitationId,
        userPhoneNumber,
        DEFAULT_STATUS
      );

    if (fetchError || !invitation) {
      throw new InvitationNotFoundError(invitationId);
    }

    // Update invitation status to rejected
    const { error: updateError } = await this.invitationRepo.updateStatus(
      invitationId,
      REJECTED_STATUS
    );

    if (updateError) {
      return { data: null, error: updateError };
    }

    // Create rejected invitation record
    return this.rejectedInvitationRepo.create({
      user_phone_number: userPhoneNumber,
      residence_id: invitation.residence_id,
      role: invitation.role,
      invitation_id: invitationId,
    });
  }

  async searchInviteCode(
    inviteCode: string,
    userPhoneNumber: string
  ): Promise<RepositoryResponse<InviteResponse>> {
    const result = await this.invitationRepo.findByInviteCodeWithDetails(
      inviteCode,
      userPhoneNumber
    );

    if (result.error || !result.data) {
      throw new InvalidInviteCodeError();
    }

    return result;
  }

  private async generateUniqueInviteCode(): Promise<string> {
    for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
      const code = this.generateInviteCode();

      const { data: existingInvite } =
        await this.invitationRepo.findByInviteCode(code);

      if (!existingInvite) {
        return code;
      }
    }

    throw new InviteCodeGenerationError();
  }

  private generateInviteCode(): string {
    // Generate a 6-character alphanumeric code
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
}

const invitationService = new InvitationService(
  invitationRepository,
  rejectedInvitationRepository,
  approvedMembershipRepository,
  pendingMembershipRepository,
  membershipStatusHistoryRepository
);

export const createResidenceInvite = (
  userPhoneNumber: string,
  residenceId: string,
  role: string,
  invitedByUserId: string,
  autoApprove?: boolean
) =>
  invitationService.createResidenceInvite(
    userPhoneNumber,
    residenceId,
    role,
    invitedByUserId,
    autoApprove
  );

export const acceptResidenceInvitation = (
  invitationId: string,
  userId: string,
  userPhoneNumber: string
) =>
  invitationService.acceptResidenceInvitation(
    invitationId,
    userId,
    userPhoneNumber
  );

export const rejectResidenceInvitation = (
  invitationId: string,
  userPhoneNumber: string
) => invitationService.rejectResidenceInvitation(invitationId, userPhoneNumber);

export const searchInviteCode = (inviteCode: string, userPhoneNumber: string) =>
  invitationService.searchInviteCode(inviteCode, userPhoneNumber);

export { invitationService };
