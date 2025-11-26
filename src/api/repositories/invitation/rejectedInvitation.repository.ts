import { RejectedResidenceMembershipInvitation } from "@models/residenceMembership";
import { supabase_client } from "../../client";
import { IRejectedInvitationRepository } from "@interfaces/rejectedInvitation.interface";
import { RepositoryResponse } from "@interfaces/profile.interface";

export class SupabaseRejectedInvitationRepository
  implements IRejectedInvitationRepository
{
  private readonly tableName = "rejected_residence_membership_invitations";

  async create(rejection: {
    user_phone_number: string;
    residence_id: string;
    role: string;
    invitation_id: string;
  }): Promise<RepositoryResponse<RejectedResidenceMembershipInvitation>> {
    return supabase_client
      .from(this.tableName)
      .insert(rejection)
      .select()
      .single();
  }
}

export const rejectedInvitationRepository =
  new SupabaseRejectedInvitationRepository();
