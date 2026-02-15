import { ResidenceWithSociety } from "@/types/api/response/residence";
import { ApprovedResidenceMembership } from "@models/residenceMembership";
import { ApiResponse } from "@/api/types/apiResponse";

export type ApprovedMembershipWithRole = {
  id: string;
  role: string;
  residence: ResidenceWithSociety;
};

export interface IApprovedMembershipRepository {
  findByUserId(
    userId: string
  ): Promise<ApiResponse<ApprovedResidenceMembership[]>>;

  findByUserIdWithResidence(
    userId: string
  ): Promise<ApiResponse<ResidenceWithSociety[]>>;

  findByUserIdWithResidenceAndRole(
    userId: string
  ): Promise<ApiResponse<ApprovedMembershipWithRole[]>>;

  findByUserIdAndResidence(
    userId: string,
    residenceId: string
  ): Promise<ApiResponse<Pick<ApprovedResidenceMembership, "id" | "role">>>;

  create(membership: {
    user_id: string;
    residence_id: string;
    role: string;
  }): Promise<ApiResponse<ApprovedResidenceMembership>>;

  updateRole(
    membershipId: string,
    role: string
  ): Promise<ApiResponse<null>>;
}
