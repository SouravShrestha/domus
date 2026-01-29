import {
  GuardInvite,
  GuardInviteWithSociety,
  GuardProfile,
  GuardProfileWithSociety,
  GuardAssignment,
  GuardAssignmentWithSociety,
  GuardRole,
} from "@/types/models/guard";
import { ApprovedMembershipWithRole } from "./approvedMembership.interface";

export type RepositoryResponse<T> = {
  data: T | null;
  error: Error | null;
};

export type GuardInviteResponse = {
  id: string;
  society_name: string;
  society_image_url?: string | null;
  role: GuardRole;
  inviter_name?: string | null;
};

export interface IGuardRepository {
  findInviteByPhone(phone: string): Promise<RepositoryResponse<GuardInvite>>;

  findInviteByCode(inviteCode: string): Promise<RepositoryResponse<GuardInvite>>;

  findInviteByCodeWithDetails(
    inviteCode: string,
    userPhone: string
  ): Promise<RepositoryResponse<GuardInviteResponse>>;

  findActiveInviteByPhoneAndSociety(
    phone: string,
    societyId: string
  ): Promise<RepositoryResponse<Pick<GuardInvite, "id">>>;

  createInvite(invite: {
    society_id: string;
    phone: string;
    name?: string;
    role: GuardRole;
    added_by: string;
    invite_code: string;
  }): Promise<RepositoryResponse<GuardInvite>>;

  updateInviteStatus(
    inviteId: string,
    status: string
  ): Promise<RepositoryResponse<null>>;

  deleteInvite(inviteId: string): Promise<RepositoryResponse<null>>;

  acceptInvite(
    inviteId: string,
    userId: string,
    societyId: string
  ): Promise<RepositoryResponse<GuardProfile>>;

  findGuardProfile(
    userId: string,
    societyId: string
  ): Promise<RepositoryResponse<GuardProfile>>;

  getGuardProfiles(
    userId: string
  ): Promise<RepositoryResponse<GuardProfileWithSociety[]>>;

  getGuardsBySociety(
    societyId: string
  ): Promise<RepositoryResponse<(GuardProfile & { user: { id: string; name: string; phone: string; photo_url?: string } })[]>>;

  getAssignments(
    userId: string,
    societyId?: string
  ): Promise<RepositoryResponse<GuardAssignmentWithSociety[]>>;

  createOrUpdateAssignment(assignment: {
    user_id: string;
    society_id: string;
    role: GuardRole;
    shift_start?: string;
    shift_end?: string;
    valid_from?: string;
    valid_till?: string;
    is_active?: boolean;
  }): Promise<RepositoryResponse<GuardAssignment>>;

  getInvitesBySociety(
    societyId: string
  ): Promise<RepositoryResponse<GuardInvite[]>>;

  createGuardProfileDirect(
    userId: string,
    societyId: string
  ): Promise<RepositoryResponse<GuardProfile>>;
}

export type AssignOrInviteResult = 
  | { type: 'assigned'; profile: GuardProfile }
  | { type: 'invited'; invite: GuardInvite };

export interface IGuardService {
  createGuardInvite(
    societyId: string,
    phone: string,
    role: GuardRole,
    addedBy: string,
    name?: string
  ): Promise<RepositoryResponse<GuardInvite>>;

  searchGuardInviteCode(
    inviteCode: string,
    userPhone: string
  ): Promise<RepositoryResponse<GuardInviteResponse>>;

  acceptGuardInvite(
    inviteId: string,
    userId: string,
    societyId: string
  ): Promise<RepositoryResponse<GuardProfile>>;

  deleteGuardInvite(
    inviteId: string,
    deletedBy: string
  ): Promise<RepositoryResponse<null>>;

  getGuardSocietiesAsResidences(
    userId: string
  ): Promise<RepositoryResponse<ApprovedMembershipWithRole[]>>;

  getGuardsBySociety(
    societyId: string
  ): Promise<RepositoryResponse<(GuardProfile & { user: { id: string; name: string; phone: string; photo_url?: string } })[]>>;

  getGuardInvitesBySociety(
    societyId: string
  ): Promise<RepositoryResponse<GuardInvite[]>>;

  getActiveAssignments(
    userId: string
  ): Promise<RepositoryResponse<GuardAssignmentWithSociety[]>>;

  assignOrInviteGuard(
    societyId: string,
    phone: string,
    role: GuardRole,
    addedBy: string,
    name?: string
  ): Promise<RepositoryResponse<AssignOrInviteResult>>;
}
