import { PushToken, PushTokenCreate } from "@models/pushToken";
import { supabase_client } from "../../client";
import { IPushTokenRepository } from "@interfaces/pushToken.interface";
import { ApiResponse } from "@/api/types/apiResponse";

export class SupabasePushTokenRepository implements IPushTokenRepository {
  private readonly tableName = "user_push_tokens";

  async findByUserId(userId: string): Promise<ApiResponse<PushToken[]>> {
    return supabase_client
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId);
  }

  async findByToken(token: string): Promise<ApiResponse<PushToken>> {
    return supabase_client
      .from(this.tableName)
      .select("*")
      .eq("expo_push_token", token)
      .single();
  }

  async upsert(data: PushTokenCreate): Promise<ApiResponse<PushToken>> {
    return supabase_client
      .from(this.tableName)
      .upsert(data, { onConflict: "user_id,expo_push_token" })
      .select()
      .single();
  }

  async delete(
    userId: string,
    token: string
  ): Promise<ApiResponse<null>> {
    return supabase_client
      .from(this.tableName)
      .delete()
      .eq("user_id", userId)
      .eq("expo_push_token", token);
  }

  async deleteAllForUser(userId: string): Promise<ApiResponse<null>> {
    return supabase_client.from(this.tableName).delete().eq("user_id", userId);
  }
}

export const pushTokenRepository = new SupabasePushTokenRepository();
