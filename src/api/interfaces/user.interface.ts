import {
  ApprovedResidenceMembership,
  PendingResidenceMembership,
} from "@models/residenceMembership";
import {
  ResidenceWithSociety,
  ResidenceResponse,
} from "@/types/api/response/residence";
import { ApiResponse } from "@/api/types/apiResponse";
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
  ): Promise<ApiResponse<ResidenceWithSociety[]>>;

  fetchUserMemberships(
    userId: string
  ): Promise<ApiResponse<ApprovedResidenceMembership[]>>;

  fetchPendingMembershipStatus(
    membershipId: string
  ): Promise<ApiResponse<PendingResidenceMembership>>;

  fetchCompleteMembershipHistory(
    userId?: string
  ): Promise<ApiResponse<ResidenceResponse>>;
}
