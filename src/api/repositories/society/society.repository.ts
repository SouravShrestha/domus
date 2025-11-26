import { Society } from "@models/society";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import { supabase_client } from "../../client";
import { ISocietyRepository } from "@interfaces/society.interface";
import { RepositoryResponse } from "@interfaces/profile.interface";

export class SupabaseSocietyRepository implements ISocietyRepository {
  private readonly tableName = "societies";

  async findById(societyId: string): Promise<RepositoryResponse<Society>> {
    return supabase_client
      .from(this.tableName)
      .select("*")
      .eq("id", societyId)
      .single();
  }

  async fetchSocietyResidences(
    societyId: string
  ): Promise<RepositoryResponse<ResidenceWithSociety[]>> {
    const { data, error } = await supabase_client
      .from("residences")
      .select(
        `
        *,
        society:societies(*)
      `
      )
      .eq("society_id", societyId);

    if (data) {
      return { data: data as ResidenceWithSociety[], error };
    }

    return { data: null, error };
  }
}

export const societyRepository = new SupabaseSocietyRepository();
