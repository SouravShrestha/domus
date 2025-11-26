import {
  ApprovedResidenceMembership,
  PendingResidenceMembership,
} from "@models/residenceMembership";
import {
  ResidenceWithSociety,
  ResidenceResponse,
} from "@/types/api/response/residence";
import { RepositoryResponse } from "@interfaces/profile.interface";
import { IUserService } from "@interfaces/user.interface";
import { IApprovedMembershipRepository } from "@interfaces/approvedMembership.interface";
import { IPendingMembershipRepository } from "@interfaces/pendingMembership.interface";
import { approvedMembershipRepository } from "@repositories/membership/approvedMembership.repository";
import { pendingMembershipRepository } from "@repositories/membership/pendingMembership.repository";
import { supabase_client } from "../client";

export class UserService implements IUserService {
  constructor(
    private readonly approvedMembershipRepo: IApprovedMembershipRepository,
    private readonly pendingMembershipRepo: IPendingMembershipRepository
  ) { }

  async fetchUserResidences(
    userId: string
  ): Promise<RepositoryResponse<ResidenceWithSociety[]>> {
    return this.approvedMembershipRepo.findByUserIdWithResidence(userId);
  }

  async fetchUserMemberships(
    userId: string
  ): Promise<RepositoryResponse<ApprovedResidenceMembership[]>> {
    return this.approvedMembershipRepo.findByUserId(userId);
  }

  async fetchPendingMembershipStatus(
    membershipId: string
  ): Promise<RepositoryResponse<PendingResidenceMembership>> {
    return this.pendingMembershipRepo.findById(membershipId);
  }

  async fetchCompleteMembershipHistory(
    userId?: string
  ): Promise<RepositoryResponse<ResidenceResponse>> {
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const {
        data: { user },
      } = await supabase_client.auth.getUser();
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      effectiveUserId = user.id;
    }
    return this.pendingMembershipRepo.findByUserIdWithResidenceAndSociety(
      effectiveUserId
    );
  }
}

const userService = new UserService(
  approvedMembershipRepository,
  pendingMembershipRepository
);

export const fetchUserResidences = (userId: string) =>
  userService.fetchUserResidences(userId);
export const fetchUserMemberships = (userId: string) =>
  userService.fetchUserMemberships(userId);
export const fetchPendingMembershipStatus = (membershipId: string) =>
  userService.fetchPendingMembershipStatus(membershipId);
export const fetchCompleteMembershipHistory = (userId?: string) =>
  userService.fetchCompleteMembershipHistory(userId);

export { userService };
