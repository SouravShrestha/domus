import { MemberPermissions, PermissionKey } from "@/types/models/memberPermissions";
import { ApiResponse } from "@/api/types/apiResponse";

export interface IMemberPermissionsRepository {
    findByMembershipId(membershipId: string): Promise<ApiResponse<MemberPermissions>>;
    findByUserIdAndResidence(userId: string, residenceId: string): Promise<ApiResponse<MemberPermissions>>;
    findAllByResidenceId(residenceId: string): Promise<ApiResponse<MemberPermissions[]>>;
    update(
        membershipId: string,
        permissions: Partial<Record<PermissionKey, boolean>>
    ): Promise<ApiResponse<MemberPermissions>>;
    resetToDefault(membershipId: string, role: string): Promise<ApiResponse<MemberPermissions>>;
}

export interface IMemberPermissionsService {
    getMemberPermissions(membershipId: string): Promise<ApiResponse<MemberPermissions>>;
    getMyPermissions(userId: string, residenceId: string): Promise<ApiResponse<MemberPermissions>>;
    getAllResidencePermissions(residenceId: string): Promise<ApiResponse<MemberPermissions[]>>;
    updateMemberPermissions(
        membershipId: string,
        permissions: Partial<Record<PermissionKey, boolean>>
    ): Promise<ApiResponse<MemberPermissions>>;
    resetToRoleDefaults(membershipId: string, role: string): Promise<ApiResponse<MemberPermissions>>;
}
