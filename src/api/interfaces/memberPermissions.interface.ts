import { MemberPermissions, PermissionKey } from "@/types/models/memberPermissions";
import { RepositoryResponse } from "@interfaces/profile.interface";

export interface IMemberPermissionsRepository {
    findByMembershipId(membershipId: string): Promise<RepositoryResponse<MemberPermissions>>;
    findByUserIdAndResidence(userId: string, residenceId: string): Promise<RepositoryResponse<MemberPermissions>>;
    findAllByResidenceId(residenceId: string): Promise<RepositoryResponse<MemberPermissions[]>>;
    update(
        membershipId: string,
        permissions: Partial<Record<PermissionKey, boolean>>
    ): Promise<RepositoryResponse<MemberPermissions>>;
    resetToDefault(membershipId: string, role: string): Promise<RepositoryResponse<MemberPermissions>>;
}

export interface IMemberPermissionsService {
    getMemberPermissions(membershipId: string): Promise<RepositoryResponse<MemberPermissions>>;
    getMyPermissions(userId: string, residenceId: string): Promise<RepositoryResponse<MemberPermissions>>;
    getAllResidencePermissions(residenceId: string): Promise<RepositoryResponse<MemberPermissions[]>>;
    updateMemberPermissions(
        membershipId: string,
        permissions: Partial<Record<PermissionKey, boolean>>
    ): Promise<RepositoryResponse<MemberPermissions>>;
    resetToRoleDefaults(membershipId: string, role: string): Promise<RepositoryResponse<MemberPermissions>>;
}
