import { RejectedResidenceMembershipInvitation } from "@models/residenceMembership";
import { supabase_client } from "../../client";
import { IRejectedInvitationRepository } from "@interfaces/rejectedInvitation.interface";
import { ApiResponse } from "@/api/types/apiResponse";

export class SupabaseRejectedInvitationRepository
  implements IRejectedInvitationRepository
{
  private readonly tableName = "rejected_residence_membership_invitations";

  async create(rejection: {
    user_phone_number: string;
    residence_id: string;
    role: string;
    invitation_id: string;
  }): Promise<ApiResponse<RejectedResidenceMembershipInvitation>> {
    return supabase_client
      .from(this.tableName)
      .insert(rejection)
      .select()
      .single();
  }
}

export const rejectedInvitationRepository =
  new SupabaseRejectedInvitationRepository();
