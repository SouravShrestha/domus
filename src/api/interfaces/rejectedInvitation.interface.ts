import { RejectedResidenceMembershipInvitation } from "@models/residenceMembership";
import { RepositoryResponse } from "./profile.interface";

export interface IRejectedInvitationRepository {
  create(rejection: {
    user_phone_number: string;
    residence_id: string;
    role: string;
    invitation_id: string;
  }): Promise<RepositoryResponse<RejectedResidenceMembershipInvitation>>;
}
