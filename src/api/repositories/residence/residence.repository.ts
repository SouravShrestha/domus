import { supabase_client } from "../../client";
import { IResidenceRepository, ResidenceMembersResponse } from "@interfaces/residence.interface";
import { RepositoryResponse } from "@interfaces/profile.interface";
import { ResidenceWithSociety } from "@/types/api/response/residence";

export class SupabaseResidenceRepository implements IResidenceRepository {
  private readonly tableName = "residences";

  async findByIdWithSociety(
    residenceId: string
  ): Promise<RepositoryResponse<ResidenceWithSociety>> {
    return supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        society:societies(*)
      `
      )
      .eq("id", residenceId)
      .single();
  }

  async findMembersByResidenceId(
    residenceId: string
  ): Promise<RepositoryResponse<ResidenceMembersResponse>> {
    try {
      const { data: approvedData, error: approvedError } = await supabase_client
        .from("approved_residence_memberships")
        .select(`
          id,
          user_id,
          role,
          created_at,
          user:user_profiles!inner(
            id,
            name,
            phone,
            photo_url
          )
        `)
        .eq("residence_id", residenceId)
        .order("created_at", { ascending: true });

      if (approvedError) {
        return { data: null, error: approvedError };
      }

      const { data: pendingData, error: pendingError } = await supabase_client
        .from("residence_membership_invitations")
        .select(`
          id,
          user_phone_number,
          role,
          status,
          invite_code,
          invitee_name,
          created_at,
          updated_at
        `)
        .eq("residence_id", residenceId)
        .eq("status", "invited")
        .order("created_at", { ascending: false });

      if (pendingError) {
        return { data: null, error: pendingError };
      }

      const approved = (approvedData || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        role: item.role,
        created_at: item.created_at,
        user: item.user,
      }));

      const pending = (pendingData || []).map((item: any) => ({
        id: item.id,
        user_phone_number: item.user_phone_number,
        role: item.role,
        status: item.status,
        invite_code: item.invite_code,
        invitee_name: item.invitee_name,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      return {
        data: { approved, pending },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as any,
      };
    }
  }
}

export const residenceRepository = new SupabaseResidenceRepository();
