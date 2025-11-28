import {
  ApprovedResidenceMembership,
  PendingResidenceMembership,
} from "@models/residenceMembership";
import {
  ResidenceWithSociety,
  ResidenceResponse,
} from "@/types/api/response/residence";
import { RepositoryResponse } from "./profile.interface";
import { UserProfile } from "@models/user";

export interface IUserService {
  getCurrentUser(): Promise<UserProfile | null>;

  updateUser(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null>;

  updateProfilePicture(
    userId: string,
    photoUrl: string
  ): Promise<UserProfile | null>;

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
