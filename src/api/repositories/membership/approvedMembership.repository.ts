import { ApprovedResidenceMembership } from "@models/residenceMembership";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import { ApprovedResidenceMembershipWithResidence } from "@/types/api/response/residenceMembership";
import { supabase_client } from "../../client";
import { IApprovedMembershipRepository, ApprovedMembershipWithRole } from "@interfaces/approvedMembership.interface";
import { ApiResponse } from "@/api/types/apiResponse";

export class SupabaseApprovedMembershipRepository
  implements IApprovedMembershipRepository
{
  private readonly tableName = "resident_profiles";

  async findByUserId(
    userId: string
  ): Promise<ApiResponse<ApprovedResidenceMembership[]>> {
    return supabase_client
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId);
  }

  async findByUserIdWithResidence(
    userId: string
  ): Promise<ApiResponse<ResidenceWithSociety[]>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        residence:residences(
          *,
          society:societies(*)
        )
      `
      )
      .eq("user_id", userId);

    if (data) {
      const residences = (data as ApprovedResidenceMembershipWithResidence[])
        .map((membership) => membership.residence)
        .filter((r): r is ResidenceWithSociety => r !== null);
      return { data: residences, error };
    }

    return { data: null, error };
  }

  async findByUserIdWithResidenceAndRole(
    userId: string
  ): Promise<ApiResponse<ApprovedMembershipWithRole[]>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        residence:residences(
          *,
          society:societies(*)
        )
      `
      )
      .eq("user_id", userId);

    if (data) {
      return { data: data as ApprovedMembershipWithRole[], error };
    }

    return { data: null, error };
  }

  async findByUserIdAndResidence(
    userId: string,
    residenceId: string
  ): Promise<ApiResponse<Pick<ApprovedResidenceMembership, "id" | "role">>> {
    return supabase_client
      .from(this.tableName)
      .select("id, role")
      .eq("user_id", userId)
      .eq("residence_id", residenceId)
      .maybeSingle();
  }

  async create(membership: {
    user_id: string;
    residence_id: string;
    role: string;
  }): Promise<ApiResponse<ApprovedResidenceMembership>> {
    return supabase_client
      .from(this.tableName)
      .insert(membership)
      .select()
      .single();
  }

  async updateRole(
    membershipId: string,
    role: string
  ): Promise<ApiResponse<null>> {
    const { error } = await supabase_client
      .from(this.tableName)
      .update({ role })
      .eq("id", membershipId);

    return { data: null, error };
  }
}

export const approvedMembershipRepository =
  new SupabaseApprovedMembershipRepository();
