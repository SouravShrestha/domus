import { MemberPermissions, PermissionKey, DEFAULT_PERMISSIONS, MemberRole } from "@/types/models/memberPermissions";
import { supabase_client } from "../../client";
import { IMemberPermissionsRepository } from "@interfaces/memberPermissions.interface";
import { RepositoryResponse } from "@interfaces/profile.interface";

export class SupabaseMemberPermissionsRepository implements IMemberPermissionsRepository {
    private readonly tableName = "member_permissions";

    async findByMembershipId(membershipId: string): Promise<RepositoryResponse<MemberPermissions>> {
        return supabase_client
            .from(this.tableName)
            .select("*")
            .eq("membership_id", membershipId)
            .single();
    }

    async findByUserIdAndResidence(
        userId: string,
        residenceId: string
    ): Promise<RepositoryResponse<MemberPermissions>> {
        return supabase_client
            .from(this.tableName)
            .select("*")
            .eq("user_id", userId)
            .eq("residence_id", residenceId)
            .single();
    }

    async findAllByResidenceId(residenceId: string): Promise<RepositoryResponse<MemberPermissions[]>> {
        return supabase_client
            .from(this.tableName)
            .select("*")
            .eq("residence_id", residenceId);
    }

    async update(
        membershipId: string,
        permissions: Partial<Record<PermissionKey, boolean>>
    ): Promise<RepositoryResponse<MemberPermissions>> {
        return supabase_client
            .from(this.tableName)
            .update({
                ...permissions,
                updated_at: new Date().toISOString(),
            })
            .eq("membership_id", membershipId)
            .select()
            .single();
    }

    async resetToDefault(
        membershipId: string,
        role: string
    ): Promise<RepositoryResponse<MemberPermissions>> {
        const defaults = DEFAULT_PERMISSIONS[role as MemberRole] || DEFAULT_PERMISSIONS.adult;
        return supabase_client
            .from(this.tableName)
            .update({
                ...defaults,
                updated_at: new Date().toISOString(),
            })
            .eq("membership_id", membershipId)
            .select()
            .single();
    }
}

export const memberPermissionsRepository = new SupabaseMemberPermissionsRepository();
