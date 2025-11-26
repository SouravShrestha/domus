import { PendingResidenceMembership } from "@models/residenceMembership";
import { RepositoryResponse } from "./profile.interface";
import { ResidenceResponse } from "@/types/api/response/residence";

export interface IPendingMembershipRepository {
  findByUserIdWithResidenceAndSociety(
    userId?: string
  ): Promise<RepositoryResponse<ResidenceResponse>>;

  findByUserAndResidence(
    userId: string,
    residenceId: string,
    statuses: string[]
  ): Promise<RepositoryResponse<Pick<PendingResidenceMembership, "id" | "status">>>;

  findById(
    membershipId: string
  ): Promise<RepositoryResponse<PendingResidenceMembership>>;

  create(membership: {
    user_id: string;
    residence_id: string;
    role: string;
    status: string;
    invitation_id: string | null;
  }): Promise<RepositoryResponse<PendingResidenceMembership>>;

  findByUserIdWithDetails(userId: string): Promise<RepositoryResponse<unknown[]>>;
}
