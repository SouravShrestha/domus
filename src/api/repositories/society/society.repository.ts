import { Society } from "@models/society";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import { supabase_client } from "../../client";
import { ISocietyRepository } from "@interfaces/society.interface";
import { BaseRepository } from "@/api/repositories/base/baseRepository";
import { ApiResponse } from "@/api/types/apiResponse";

export class SupabaseSocietyRepository
  extends BaseRepository<Society>
  implements ISocietyRepository
{
  constructor() {
    super("societies");
  }

  async fetchSocietyResidences(
    societyId: string
  ): Promise<ApiResponse<ResidenceWithSociety[]>> {
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
