import {
  GuardInvite,
  GuardProfile,
  GuardProfileWithSociety,
  GuardAssignment,
  GuardAssignmentWithSociety,
  GuardRole,
} from "@/types/models/guard";
import { ApprovedMembershipWithRole } from "./approvedMembership.interface";
import { ApiResponse } from "@/api/types/apiResponse";

export type GuardInviteResponse = {
  id: string;
  society_name: string;
  society_image_url?: string | null;
  role: GuardRole;
  inviter_name?: string | null;
};

export interface IGuardRepository {
  findInviteByPhone(phone: string): Promise<ApiResponse<GuardInvite>>;

  findInviteByCode(inviteCode: string): Promise<ApiResponse<GuardInvite>>;

  findInviteByCodeWithDetails(
    inviteCode: string,
    userPhone: string
  ): Promise<ApiResponse<GuardInviteResponse>>;

  findActiveInviteByPhoneAndSociety(
    phone: string,
    societyId: string
  ): Promise<ApiResponse<Pick<GuardInvite, "id">>>;

  createInvite(invite: {
    society_id: string;
    phone: string;
    name?: string;
    role: GuardRole;
    added_by: string;
    invite_code: string;
  }): Promise<ApiResponse<GuardInvite>>;

  updateInviteStatus(
    inviteId: string,
    status: string
  ): Promise<ApiResponse<null>>;

  deleteInvite(inviteId: string): Promise<ApiResponse<null>>;

  acceptInvite(
    inviteId: string,
    userId: string,
    societyId: string
  ): Promise<ApiResponse<GuardProfile>>;

  findGuardProfile(
    userId: string,
    societyId: string
  ): Promise<ApiResponse<GuardProfile>>;

  getGuardProfiles(
    userId: string
  ): Promise<ApiResponse<GuardProfileWithSociety[]>>;

  getGuardsBySociety(
    societyId: string
  ): Promise<ApiResponse<(GuardProfile & { user: { id: string; name: string; phone: string; photo_url?: string } })[]>>;

  getAssignments(
    userId: string,
    societyId?: string
  ): Promise<ApiResponse<GuardAssignmentWithSociety[]>>;

  createOrUpdateAssignment(assignment: {
    guard_profile_id: string;
    society_id: string;
    gate_ids: string[];
    shift_start: string;
    shift_end: string;
    status?: "scheduled" | "active" | "completed" | "cancelled";
    allow_anytime_access?: boolean;
  }): Promise<ApiResponse<GuardAssignment>>;

  getInvitesBySociety(
    societyId: string
  ): Promise<ApiResponse<GuardInvite[]>>;

  createGuardProfileDirect(
    userId: string,
    societyId: string
  ): Promise<ApiResponse<GuardProfile>>;

  getAssignmentsByGate(
    gateId: string
  ): Promise<ApiResponse<(GuardAssignment & { 
    guard: { id: string; name: string; phone: string; photo_url?: string } 
  })[]>>;

  deleteGuardProfile(
    guardProfileId: string
  ): Promise<ApiResponse<null>>;

  deleteAssignment(
    assignmentId: string
  ): Promise<ApiResponse<null>>;

  updateAssignment(
    assignmentId: string,
    data: {
      gate_ids?: string[];
      shift_id?: string;
      shift_start?: string;
      shift_end?: string;
      allow_anytime_access?: boolean;
    }
  ): Promise<ApiResponse<GuardAssignment>>;
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
  ): Promise<ApiResponse<GuardInvite>>;

  searchGuardInviteCode(
    inviteCode: string,
    userPhone: string
  ): Promise<ApiResponse<GuardInviteResponse>>;

  acceptGuardInvite(
    inviteId: string,
    userId: string,
    societyId: string
  ): Promise<ApiResponse<GuardProfile>>;

  deleteGuardInvite(
    inviteId: string,
    deletedBy: string
  ): Promise<ApiResponse<null>>;

  getGuardSocietiesAsResidences(
    userId: string
  ): Promise<ApiResponse<ApprovedMembershipWithRole[]>>;

  getGuardsBySociety(
    societyId: string
  ): Promise<ApiResponse<(GuardProfile & { user: { id: string; name: string; phone: string; photo_url?: string } })[]>>;

  getGuardInvitesBySociety(
    societyId: string
  ): Promise<ApiResponse<GuardInvite[]>>;

  getActiveAssignments(
    userId: string
  ): Promise<ApiResponse<GuardAssignmentWithSociety[]>>;

  assignOrInviteGuard(
    societyId: string,
    phone: string,
    role: GuardRole,
    addedBy: string,
    name?: string
  ): Promise<ApiResponse<AssignOrInviteResult>>;

  deleteGuardProfile(
    guardProfileId: string
  ): Promise<ApiResponse<null>>;

  assignDuty(params: {
    guardProfileId: string;
    societyId: string;
    gateIds: string[];
    shiftId: string;
    shiftStart: string;
    shiftEnd: string;
    allowAnytimeAccess: boolean;
  }): Promise<ApiResponse<GuardAssignment>>;

  unassignDuty(
    assignmentId: string
  ): Promise<ApiResponse<null>>;

  updateDuty(
    assignmentId: string,
    params: {
      gateIds?: string[];
      shiftId?: string;
      shiftStart?: string;
      shiftEnd?: string;
      allowAnytimeAccess?: boolean;
    }
  ): Promise<ApiResponse<GuardAssignment>>;
}
