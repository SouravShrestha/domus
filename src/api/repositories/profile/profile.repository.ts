import { UserProfile } from "@models/user";
import { supabase_client } from "../../client";
import { IProfileRepository } from "@interfaces/profile.interface";
import { BaseRepository } from "@/api/repositories/base/baseRepository";
import { ApiResponse } from "@/api/types/apiResponse";

export class SupabaseProfileRepository
  extends BaseRepository<UserProfile>
  implements IProfileRepository
{
  constructor() {
    super("user_profiles");
  }

  async findByEmail(
    email: string
  ): Promise<ApiResponse<Pick<UserProfile, "id">>> {
    return supabase_client
      .from(this.tableName)
      .select("id")
      .eq("email", email)
      .maybeSingle();
  }

  async findByPhone(
    phone: string
  ): Promise<ApiResponse<Pick<UserProfile, "id">>> {
    return supabase_client
      .from(this.tableName)
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
  }

  async create(profile: UserProfile): Promise<ApiResponse<UserProfile>> {
    return supabase_client.from(this.tableName).insert(profile).select().single();
  }

  async upsert(profile: UserProfile): Promise<ApiResponse<UserProfile>> {
    return supabase_client.from(this.tableName).upsert(profile).select().single();
  }
}

export const profileRepository = new SupabaseProfileRepository();
