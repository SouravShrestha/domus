import { ApprovedResidenceMembership } from "@models/residenceMembership";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import { ApprovedResidenceMembershipWithResidence } from "@/types/api/response/residenceMembership";
import { supabase_client } from "../../client";
import { IApprovedMembershipRepository, ApprovedMembershipWithRole } from "@interfaces/approvedMembership.interface";
import { RepositoryResponse } from "@interfaces/profile.interface";

export class SupabaseApprovedMembershipRepository
  implements IApprovedMembershipRepository
{
  private readonly tableName = "approved_residence_memberships";

  async findByUserId(
    userId: string
  ): Promise<RepositoryResponse<ApprovedResidenceMembership[]>> {
    return supabase_client
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId);
  }

  async findByUserIdWithResidence(
    userId: string
  ): Promise<RepositoryResponse<ResidenceWithSociety[]>> {
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
  ): Promise<RepositoryResponse<ApprovedMembershipWithRole[]>> {
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
  ): Promise<RepositoryResponse<Pick<ApprovedResidenceMembership, "id" | "role">>> {
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
  }): Promise<RepositoryResponse<ApprovedResidenceMembership>> {
    return supabase_client
      .from(this.tableName)
      .insert(membership)
      .select()
      .single();
  }
}

export const approvedMembershipRepository =
  new SupabaseApprovedMembershipRepository();
