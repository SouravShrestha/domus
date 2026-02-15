import { RejectedResidenceMembershipInvitation } from "@models/residenceMembership";
import { ApiResponse } from "@/api/types/apiResponse";

export interface IRejectedInvitationRepository {
  create(rejection: {
    user_phone_number: string;
    residence_id: string;
    role: string;
    invitation_id: string;
  }): Promise<ApiResponse<RejectedResidenceMembershipInvitation>>;
}
