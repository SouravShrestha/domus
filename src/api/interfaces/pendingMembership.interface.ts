import { PendingResidenceMembership } from "@models/residenceMembership";
import { ApiResponse } from "@/api/types/apiResponse";
import { ResidenceResponse } from "@/types/api/response/residence";

export interface IPendingMembershipRepository {
  findByUserIdWithResidenceAndSociety(
    userId?: string
  ): Promise<ApiResponse<ResidenceResponse>>;

  findByUserAndResidence(
    userId: string,
    residenceId: string,
    statuses: string[]
  ): Promise<ApiResponse<Pick<PendingResidenceMembership, "id" | "status">>>;

  findById(
    membershipId: string
  ): Promise<ApiResponse<PendingResidenceMembership>>;

  create(membership: {
    user_id: string;
    residence_id: string;
    role: string;
    status: string;
    invitation_id: string | null;
  }): Promise<ApiResponse<PendingResidenceMembership>>;

  findByUserIdWithDetails(userId: string): Promise<ApiResponse<unknown[]>>;
}
