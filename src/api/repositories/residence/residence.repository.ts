import { supabase_client } from "../../client";
import { IResidenceRepository } from "@interfaces/residence.interface";
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
}

export const residenceRepository = new SupabaseResidenceRepository();
