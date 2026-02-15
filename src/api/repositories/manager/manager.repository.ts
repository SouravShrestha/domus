import { supabase_client } from "../../client";
import { IManagerRepository } from "@interfaces/manager.interface";
import { ApiResponse } from "@/api/types/apiResponse";
import { SocietyManager, SocietyManagerWithSociety } from "@/types/models/manager";
import { ApprovedMembershipWithRole } from "@interfaces/approvedMembership.interface";

export class SupabaseManagerRepository implements IManagerRepository {
  private readonly tableName = "manager_profiles";

  async existsByUserId(userId: string): Promise<ApiResponse<boolean>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (error) {
      return { data: null, error };
    }

    return { data: data && data.length > 0, error: null };
  }

  async findByUserId(
    userId: string
  ): Promise<ApiResponse<SocietyManagerWithSociety[]>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(`
        *,
        society:societies(id, name, code, image_url)
      `)
      .eq("user_id", userId);

    if (error) {
      return { data: null, error };
    }

    return { data: data as SocietyManagerWithSociety[], error: null };
  }

  async findByUserIdAndSociety(
    userId: string,
    societyId: string
  ): Promise<ApiResponse<SocietyManager>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .eq("society_id", societyId)
      .maybeSingle();

    return { data: data as SocietyManager | null, error };
  }

  async findByUserIdAsResidences(
    userId: string
  ): Promise<ApiResponse<ApprovedMembershipWithRole[]>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(`
        id,
        society_id,
        society:societies(
          id,
          name,
          code,
          image_url,
          created_at
        )
      `)
      .eq("user_id", userId);

    if (error) {
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    const formattedData = data.map((manager: any) => ({
      id: manager.id,
      role: "manager" as const,
      residence: {
        id: manager.society_id,
        society_id: manager.society.id,
        flat_number: "N/A",
        block: null,
        floor_number: null,
        short_name: "Manager",
        created_at: manager.society.created_at,
        society: {
          id: manager.society.id,
          name: manager.society.name,
          code: manager.society.code,
          image_url: manager.society.image_url,
        },
      },
    })) as ApprovedMembershipWithRole[];

    return { data: formattedData, error: null };
  }
}

export const managerRepository = new SupabaseManagerRepository();
