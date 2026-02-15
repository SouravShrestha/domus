import { ApiResponse } from "@/api/types/apiResponse";

export interface IMembershipStatusHistoryRepository {
  create(history: {
    pending_membership_id: string;
    status: string;
    changed_by: string;
    notes: string;
  }): Promise<ApiResponse<null>>;
}
