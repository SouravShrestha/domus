import { guardRepository } from "@repositories/guard/guard.repository";
import {
  IGuardRepository,
  IGuardService,
  GuardInviteResponse,
  AssignOrInviteResult,
} from "@interfaces/guard.interface";
import { ApiResponse } from "@/api/types/apiResponse";
import { findByPhone } from "@api/services/profile.service";
import {
  GuardInvite,
  GuardProfile,
  GuardAssignment,
  GuardAssignmentWithSociety,
  GuardRole,
} from "@/types/models/guard";
import { ApprovedMembershipWithRole } from "@interfaces/approvedMembership.interface";
import { formatPhoneForApi } from "@/utils/phoneHelpers";
import { apiLogger } from '@/api/utils/logger';

import { generateAlphanumericCode, generateUniqueCode } from '@/api/utils/codeGenerator';

const MAX_CODE_GENERATION_ATTEMPTS = 10;

export class GuardService implements IGuardService {
  constructor(private readonly repository: IGuardRepository) {}

  private async generateUniqueInviteCode(): Promise<string> {
    return generateUniqueCode(
      () => generateAlphanumericCode(6),
      async (code) => {
        const { data } = await this.repository.findInviteByCode(code);
        return !data;
      },
      MAX_CODE_GENERATION_ATTEMPTS
    );
  }

  async createGuardInvite(
    societyId: string,
    phone: string,
    role: GuardRole,
    addedBy: string,
    name?: string
  ): Promise<ApiResponse<GuardInvite>> {
    const formattedPhone = formatPhoneForApi(phone);

    const { data: existingInvite } =
      await this.repository.findActiveInviteByPhoneAndSociety(
        formattedPhone,
        societyId
      );

    if (existingInvite) {
      return {
        data: null,
        error: new Error("An active invite already exists for this phone number"),
      };
    }

    const inviteCode = await this.generateUniqueInviteCode();

    return this.repository.createInvite({
      society_id: societyId,
      phone: formattedPhone,
      name,
      role,
      added_by: addedBy,
      invite_code: inviteCode,
    });
  }

  async searchGuardInviteCode(
    inviteCode: string,
    userPhone: string
  ): Promise<ApiResponse<GuardInviteResponse>> {
    const formattedPhone = formatPhoneForApi(userPhone);
    const result = await this.repository.findInviteByCodeWithDetails(
      inviteCode,
      formattedPhone
    );

    if (result.error || !result.data) {
      return {
        data: null,
        error: new Error("Invalid invite code or invite not found"),
      };
    }

    return result;
  }

  async acceptGuardInvite(
    inviteId: string,
    userId: string,
    societyId: string
  ): Promise<ApiResponse<GuardProfile>> {
    const { data: existingProfile } = await this.repository.findGuardProfile(
      userId,
      societyId
    );

    if (existingProfile) {
      return {
        data: null,
        error: new Error("You are already a guard for this society"),
      };
    }

    return this.repository.acceptInvite(inviteId, userId, societyId);
  }

  async deleteGuardInvite(
    inviteId: string,
    _deletedBy: string
  ): Promise<ApiResponse<null>> {
    return this.repository.deleteInvite(inviteId);
  }

  async getGuardSocietiesAsResidences(
    userId: string
  ): Promise<ApiResponse<ApprovedMembershipWithRole[]>> {
    try {
      const { data, error } = await this.repository.getGuardProfiles(userId);

      if (error) {
        return { data: null, error };
      }

      if (!data || data.length === 0) {
        return { data: [], error: null };
      }

      const formattedData = data.map((guard: any) => ({
        id: guard.id,
        role: "guard" as const,
        residence: {
          id: guard.society_id,
          society_id: guard.society.id,
          flat_number: null,
          building_name: null,
          floor: null,
          wing: null,
          created_at: guard.created_at,
          society: {
            id: guard.society.id,
            name: guard.society.name,
            code: guard.society.code,
            image_url: guard.society.image_url,
          },
        },
      })) as unknown as ApprovedMembershipWithRole[];

      return { data: formattedData, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getGuardsBySociety(
    societyId: string
  ): Promise<ApiResponse<(GuardProfile & { user: { id: string; name: string; phone: string; photo_url?: string } })[]>> {
    return this.repository.getGuardsBySociety(societyId);
  }

  async getGuardInvitesBySociety(
    societyId: string
  ): Promise<ApiResponse<GuardInvite[]>> {
    return this.repository.getInvitesBySociety(societyId);
  }

  async getActiveAssignments(
    userId: string
  ): Promise<ApiResponse<GuardAssignmentWithSociety[]>> {
    try {
      const { data: profiles, error: profileError } =
        await this.repository.getGuardProfiles(userId);

      if (profileError || !profiles || profiles.length === 0) {
        return { data: [], error: profileError };
      }

      const allAssignments: GuardAssignmentWithSociety[] = [];

      for (const profile of profiles) {
        const { data: assignments, error } =
          await this.repository.getAssignments(profile.id);

        if (!error && assignments) {
          allAssignments.push(...assignments);
        }
      }

      return { data: allAssignments, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async assignOrInviteGuard(
    societyId: string,
    phone: string,
    role: GuardRole,
    addedBy: string,
    name?: string
  ): Promise<ApiResponse<AssignOrInviteResult>> {
    const formattedPhone = formatPhoneForApi(phone);

    // Check if there's already an active invite or profile for this phone/society
    const { data: existingInvite } =
      await this.repository.findActiveInviteByPhoneAndSociety(
        formattedPhone,
        societyId
      );

    if (existingInvite) {
      return {
        data: null,
        error: new Error("An active invite already exists for this phone number"),
      };
    }

    // Check if user_profile exists for this phone number
    const { data: userProfile, error: profileError } = await findByPhone(formattedPhone);

    if (profileError) {
      apiLogger.error("GuardService", "Error checking user profile", profileError);
    }

    if (userProfile) {
      // User exists - check if already a guard for this society
      const { data: existingGuard } = await this.repository.findGuardProfile(
        userProfile.id,
        societyId
      );

      if (existingGuard) {
        return {
          data: null,
          error: new Error("This user is already a guard for this society"),
        };
      }

      // User exists and not already a guard - create profile directly
      const { data: profile, error } = await this.repository.createGuardProfileDirect(
        userProfile.id,
        societyId
      );

      if (error || !profile) {
        return { data: null, error: error || new Error("Failed to create guard profile") };
      }

      return { data: { type: 'assigned', profile }, error: null };
    }

    // User doesn't exist - create invite for them to accept on registration
    const inviteCode = await this.generateUniqueInviteCode();

    const { data: invite, error } = await this.repository.createInvite({
      society_id: societyId,
      phone: formattedPhone,
      name,
      role,
      added_by: addedBy,
      invite_code: inviteCode,
    });

    if (error || !invite) {
      return { data: null, error: error || new Error("Failed to create invite") };
    }

    return { data: { type: 'invited', invite }, error: null };
  }

  async deleteGuardProfile(
    guardProfileId: string
  ): Promise<ApiResponse<null>> {
    return this.repository.deleteGuardProfile(guardProfileId);
  }

  async assignDuty(params: {
    guardProfileId: string;
    societyId: string;
    gateIds: string[];
    shiftId: string;
    shiftStart: string;
    shiftEnd: string;
    allowAnytimeAccess: boolean;
  }): Promise<ApiResponse<GuardAssignment>> {
    return this.repository.createOrUpdateAssignment({
      guard_profile_id: params.guardProfileId,
      society_id: params.societyId,
      gate_ids: params.gateIds,
      shift_start: params.shiftStart,
      shift_end: params.shiftEnd,
      allow_anytime_access: params.allowAnytimeAccess,
    });
  }

  async unassignDuty(
    assignmentId: string
  ): Promise<ApiResponse<null>> {
    return this.repository.deleteAssignment(assignmentId);
  }

  async updateDuty(
    assignmentId: string,
    params: {
      gateIds?: string[];
      shiftId?: string;
      shiftStart?: string;
      shiftEnd?: string;
      allowAnytimeAccess?: boolean;
    }
  ): Promise<ApiResponse<GuardAssignment>> {
    return this.repository.updateAssignment(assignmentId, {
      gate_ids: params.gateIds,
      shift_id: params.shiftId,
      shift_start: params.shiftStart,
      shift_end: params.shiftEnd,
      allow_anytime_access: params.allowAnytimeAccess,
    });
  }
}

const guardService = new GuardService(guardRepository);

export const createGuardInvite = (
  societyId: string,
  phone: string,
  role: GuardRole,
  addedBy: string,
  name?: string
) => guardService.createGuardInvite(societyId, phone, role, addedBy, name);

export const searchGuardInviteCode = (inviteCode: string, userPhone: string) =>
  guardService.searchGuardInviteCode(inviteCode, userPhone);

export const acceptGuardInvite = (
  inviteId: string,
  userId: string,
  societyId: string
) => guardService.acceptGuardInvite(inviteId, userId, societyId);

export const deleteGuardInvite = (inviteId: string, deletedBy: string) =>
  guardService.deleteGuardInvite(inviteId, deletedBy);

export const getGuardSocietiesAsResidences = (userId: string) =>
  guardService.getGuardSocietiesAsResidences(userId);

export const getGuardsBySociety = (societyId: string) =>
  guardService.getGuardsBySociety(societyId);

export const getGuardInvitesBySociety = (societyId: string) =>
  guardService.getGuardInvitesBySociety(societyId);

export const getActiveGuardAssignments = (userId: string) =>
  guardService.getActiveAssignments(userId);

export const assignOrInviteGuard = (
  societyId: string,
  phone: string,
  role: GuardRole,
  addedBy: string,
  name?: string
) => guardService.assignOrInviteGuard(societyId, phone, role, addedBy, name);

export const getGuardsByGate = (gateId: string) =>
  guardRepository.getAssignmentsByGate(gateId);

export const deleteGuardProfile = (guardProfileId: string) =>
  guardService.deleteGuardProfile(guardProfileId);

export const assignGuardDuty = (params: {
  guardProfileId: string;
  societyId: string;
  gateIds: string[];
  shiftId: string;
  shiftStart: string;
  shiftEnd: string;
  allowAnytimeAccess: boolean;
}) => guardService.assignDuty(params);

export const unassignGuardDuty = (assignmentId: string) =>
  guardService.unassignDuty(assignmentId);

export const updateGuardDuty = (
  assignmentId: string,
  params: {
    gateIds?: string[];
    shiftId?: string;
    shiftStart?: string;
    shiftEnd?: string;
    allowAnytimeAccess?: boolean;
  }
) => guardService.updateDuty(assignmentId, params);

export { guardService };

