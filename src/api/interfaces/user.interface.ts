import {
  ApprovedResidenceMembership,
  PendingResidenceMembership,
} from "@models/residenceMembership";
import {
  ResidenceWithSociety,
  ResidenceResponse,
} from "@/types/api/response/residence";
import { RepositoryResponse } from "./profile.interface";

export interface IUserService {
  fetchUserResidences(
    userId: string
  ): Promise<RepositoryResponse<ResidenceWithSociety[]>>;

  fetchUserMemberships(
    userId: string
  ): Promise<RepositoryResponse<ApprovedResidenceMembership[]>>;

  fetchPendingMembershipStatus(
    membershipId: string
  ): Promise<RepositoryResponse<PendingResidenceMembership>>;

  fetchCompleteMembershipHistory(
    userId?: string
  ): Promise<RepositoryResponse<ResidenceResponse>>;
}
