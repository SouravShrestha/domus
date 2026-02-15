import { supabase_client } from "../../client";
import { IMembershipStatusHistoryRepository } from "@interfaces/membershipStatusHistory.interface";
import { ApiResponse } from "@/api/types/apiResponse";

export class SupabaseMembershipStatusHistoryRepository
  implements IMembershipStatusHistoryRepository
{
  private readonly tableName = "membership_status_history";

  async create(history: {
    pending_membership_id: string;
    status: string;
    changed_by: string;
    notes: string;
  }): Promise<ApiResponse<null>> {
    const { error } = await supabase_client
      .from(this.tableName)
      .insert(history);

    return { data: null, error };
  }
}

export const membershipStatusHistoryRepository =
  new SupabaseMembershipStatusHistoryRepository();
