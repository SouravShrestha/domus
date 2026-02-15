import { MemberPermissions, PermissionKey } from "@/types/models/memberPermissions";
import { ApiResponse } from "@/api/types/apiResponse";
import { IMemberPermissionsRepository, IMemberPermissionsService } from "@interfaces/memberPermissions.interface";
import { IApprovedMembershipRepository } from "@interfaces/approvedMembership.interface";
import { memberPermissionsRepository } from "@repositories/permissions/memberPermissions.repository";
import { approvedMembershipRepository } from "@repositories/membership/approvedMembership.repository";
import { logActivity } from "./activity.service";
import { ActivityType } from "@models/activity";
import { appEventEmitter, AppEvents } from "@/utils/eventEmitter";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";

export class MemberPermissionsService implements IMemberPermissionsService {
    constructor(
        private readonly permissionsRepo: IMemberPermissionsRepository,
        private readonly membershipRepo: IApprovedMembershipRepository
    ) {}

    async getMemberPermissions(membershipId: string): Promise<ApiResponse<MemberPermissions>> {
        return this.permissionsRepo.findByMembershipId(membershipId);
    }

    async getMyPermissions(
        userId: string,
        residenceId: string
    ): Promise<ApiResponse<MemberPermissions>> {
        return this.permissionsRepo.findByUserIdAndResidence(userId, residenceId);
    }

    async getAllResidencePermissions(
        residenceId: string
    ): Promise<ApiResponse<MemberPermissions[]>> {
        return this.permissionsRepo.findAllByResidenceId(residenceId);
    }

    async updateMemberPermissions(
        membershipId: string,
        permissions: Partial<Record<PermissionKey, boolean>>
    ): Promise<ApiResponse<MemberPermissions>> {
        return this.permissionsRepo.update(membershipId, permissions);
    }

    async resetToRoleDefaults(
        membershipId: string,
        role: string
    ): Promise<ApiResponse<MemberPermissions>> {
        return this.permissionsRepo.resetToDefault(membershipId, role);
    }

    async updateMemberRole(
        membershipId: string,
        role: string,
        actorUserId: string,
        residenceId: string,
        memberName: string,
        previousRole: string
    ): Promise<ApiResponse<{ id: string; role: string }>> {
        const { error } = await this.membershipRepo.updateRole(membershipId, role);

        if (error) {
            return { data: null, error };
        }

        appEventEmitter.emit(AppEvents.MEMBERSHIP_UPDATED);

        return { data: { id: membershipId, role }, error: null };
    }

    async updateMemberPermissionsWithActivity(
        membershipId: string,
        permissions: Partial<Record<PermissionKey, boolean>>,
        actorUserId: string,
        residenceId: string,
        memberName: string
    ): Promise<ApiResponse<MemberPermissions>> {
        const result = await this.permissionsRepo.update(membershipId, permissions);

        if (result.data) {
            const permissionKeys = Object.keys(permissions);
            await logActivity(
                residenceId,
                actorUserId,
                ActivityType.MEMBER_PERMISSIONS_UPDATED,
                memberName,
                {
                    member_name: memberName,
                    permissions_changed: permissionKeys,
                    permissions_count: permissionKeys.length,
                }
            );

            appEventEmitter.emit(AppEvents.PERMISSIONS_UPDATED);
            appEventEmitter.emit(AppEvents.ACTIVITIES_UPDATED);
        }

        return result;
    }

    async resetToRoleDefaultsWithActivity(
        membershipId: string,
        role: string,
        actorUserId: string,
        residenceId: string,
        memberName: string
    ): Promise<ApiResponse<MemberPermissions>> {
        const result = await this.permissionsRepo.resetToDefault(membershipId, role);

        if (result.data) {
            await logActivity(
                residenceId,
                actorUserId,
                ActivityType.MEMBER_PERMISSIONS_UPDATED,
                memberName,
                {
                    member_name: memberName,
                    reset_to_role: role,
                    reset_to_defaults: true,
                }
            );

            appEventEmitter.emit(AppEvents.PERMISSIONS_UPDATED);
            appEventEmitter.emit(AppEvents.ACTIVITIES_UPDATED);
        }

        return result;
    }
}

const memberPermissionsService = new MemberPermissionsService(
    memberPermissionsRepository,
    approvedMembershipRepository
);

export const getMemberPermissions = (membershipId: string) =>
    memberPermissionsService.getMemberPermissions(membershipId);

export const getMyPermissions = (userId: string, residenceId: string) =>
    memberPermissionsService.getMyPermissions(userId, residenceId);

export const getAllResidencePermissions = (residenceId: string) =>
    memberPermissionsService.getAllResidencePermissions(residenceId);

export const updateMemberPermissions = (
    membershipId: string,
    permissions: Partial<Record<PermissionKey, boolean>>,
    actorUserId: string,
    residenceId: string,
    memberName: string
) => memberPermissionsService.updateMemberPermissionsWithActivity(
    membershipId,
    permissions,
    actorUserId,
    residenceId,
    memberName
);

export const resetToRoleDefaults = (
    membershipId: string,
    role: string,
    actorUserId: string,
    residenceId: string,
    memberName: string
) =>
    memberPermissionsService.resetToRoleDefaultsWithActivity(
        membershipId,
        role,
        actorUserId,
        residenceId,
        memberName
    );

export const updateMemberRole = (
    membershipId: string,
    role: string,
    actorUserId: string,
    residenceId: string,
    memberName: string,
    previousRole: string
) =>
    memberPermissionsService.updateMemberRole(
        membershipId,
        role,
        actorUserId,
        residenceId,
        memberName,
        previousRole
    );

export { memberPermissionsService };
