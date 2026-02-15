import {
  ApprovedResidenceMembership,
  PendingResidenceMembership,
} from "@models/residenceMembership";
import {
  ResidenceWithSociety,
  ResidenceResponse,
} from "@/types/api/response/residence";
import { ApiResponse } from "@/api/types/apiResponse";
import { IUserService } from "@interfaces/user.interface";
import { IApprovedMembershipRepository, ApprovedMembershipWithRole } from "@interfaces/approvedMembership.interface";
import { IPendingMembershipRepository } from "@interfaces/pendingMembership.interface";
import { IProfileRepository } from "@interfaces/profile.interface";
import { approvedMembershipRepository } from "@repositories/membership/approvedMembership.repository";
import { pendingMembershipRepository } from "@repositories/membership/pendingMembership.repository";
import { profileRepository } from "@repositories/profile/profile.repository";
import { getCurrentUserId } from '@/api/utils/getCurrentUser';
import { apiLogger } from '@/api/utils/logger';
import { UserProfile } from "@models/user";

export class UserService implements IUserService {
  constructor(
    private readonly approvedMembershipRepo: IApprovedMembershipRepository,
    private readonly pendingMembershipRepo: IPendingMembershipRepository,
    private readonly profileRepo: IProfileRepository
  ) { }

  async getCurrentUser(): Promise<UserProfile | null> {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await this.profileRepo.findById(userId);

    if (error) {
      apiLogger.error("UserService", "Failed to fetch current user", error);
      return null;
    }

    return data;
  }

  async updateUser(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    const { data, error } = await this.profileRepo.update(userId, filteredUpdates);

    if (error) {
      apiLogger.error("UserService", "Failed to update user", error);
      return null;
    }

    return data;
  }

  async updateProfilePicture(
    userId: string,
    photoUrl: string
  ): Promise<UserProfile | null> {
    return this.updateUser(userId, { photo_url: photoUrl });
  }

  async fetchUserResidences(
    userId: string
  ): Promise<ApiResponse<ResidenceWithSociety[]>> {
    return this.approvedMembershipRepo.findByUserIdWithResidence(userId);
  }

  async fetchUserResidencesWithRole(
    userId: string
  ): Promise<ApiResponse<ApprovedMembershipWithRole[]>> {
    const start = performance.now();
    const result = await this.approvedMembershipRepo.findByUserIdWithResidenceAndRole(userId);
    const duration = performance.now() - start;
    apiLogger.info("UserService", `fetchUserResidencesWithRole took ${duration.toFixed(2)}ms`);
    return result;
  }

  async fetchUserMemberships(
    userId: string
  ): Promise<ApiResponse<ApprovedResidenceMembership[]>> {
    return this.approvedMembershipRepo.findByUserId(userId);
  }

  async fetchPendingMembershipStatus(
    membershipId: string
  ): Promise<ApiResponse<PendingResidenceMembership>> {
    return this.pendingMembershipRepo.findById(membershipId);
  }

  async fetchCompleteMembershipHistory(
    userId?: string
  ): Promise<ApiResponse<ResidenceResponse>> {
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      effectiveUserId = await getCurrentUserId() ?? undefined;
      if (!effectiveUserId) {
        return { data: null, error: new Error("User not authenticated") as any };
      }
    }
    return this.pendingMembershipRepo.findByUserIdWithResidenceAndSociety(
      effectiveUserId
    );
  }
}

const userService = new UserService(
  approvedMembershipRepository,
  pendingMembershipRepository,
  profileRepository
);

export const fetchUserResidences = (userId: string) =>
  userService.fetchUserResidences(userId);
export const fetchUserResidencesWithRole = (userId: string) =>
  userService.fetchUserResidencesWithRole(userId);
export const fetchUserMemberships = (userId: string) =>
  userService.fetchUserMemberships(userId);
export const fetchPendingMembershipStatus = (membershipId: string) =>
  userService.fetchPendingMembershipStatus(membershipId);
export const fetchCompleteMembershipHistory = (userId?: string) =>
  userService.fetchCompleteMembershipHistory(userId);

export { userService };
