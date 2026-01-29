import { ResidenceWithSociety } from "@/types/api/response/residence";
import { ApprovedResidenceMembership } from "@models/residenceMembership";
import { RepositoryResponse } from "./profile.interface";

export type ApprovedMembershipWithRole = {
  id: string;
  role: string;
  residence: ResidenceWithSociety;
};

export interface IApprovedMembershipRepository {
  findByUserId(
    userId: string
  ): Promise<RepositoryResponse<ApprovedResidenceMembership[]>>;

  findByUserIdWithResidence(
    userId: string
  ): Promise<RepositoryResponse<ResidenceWithSociety[]>>;

  findByUserIdWithResidenceAndRole(
    userId: string
  ): Promise<RepositoryResponse<ApprovedMembershipWithRole[]>>;

  findByUserIdAndResidence(
    userId: string,
    residenceId: string
  ): Promise<RepositoryResponse<Pick<ApprovedResidenceMembership, "id" | "role">>>;

  create(membership: {
    user_id: string;
    residence_id: string;
    role: string;
  }): Promise<RepositoryResponse<ApprovedResidenceMembership>>;
}
