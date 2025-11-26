import { RepositoryResponse } from "./profile.interface";

export interface IMembershipStatusHistoryRepository {
  create(history: {
    pending_membership_id: string;
    status: string;
    changed_by: string;
    notes: string;
  }): Promise<RepositoryResponse<null>>;
}
