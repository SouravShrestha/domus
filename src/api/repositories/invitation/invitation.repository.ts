import { Society } from "@models/society";
import { ResidenceMembershipInvitation } from "@models/residenceMembership";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import { InviteResponse } from "@/types/api/response/invite";
import { supabase_client } from "../../client";
import { IInvitationRepository, ResidenceMembershipInvitationWithDetails } from "@interfaces/invitation.interface";
import { RepositoryResponse } from "@interfaces/profile.interface";

export class SupabaseInvitationRepository implements IInvitationRepository {
  private readonly tableName = "residence_membership_invitations";

  async findActiveByPhoneAndResidence(
    userPhoneNumber: string,
    residenceId: string
  ): Promise<RepositoryResponse<Pick<ResidenceMembershipInvitation, "id">>> {
    return supabase_client
      .from(this.tableName)
      .select("id")
      .eq("user_phone_number", userPhoneNumber)
      .eq("residence_id", residenceId)
      .in("status", ["invited", "accepted"])
      .maybeSingle();
  }

  async findByInviteCode(
    inviteCode: string
  ): Promise<RepositoryResponse<Pick<ResidenceMembershipInvitation, "id">>> {
    return supabase_client
      .from(this.tableName)
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();
  }

  async findByIdAndPhoneNumber(
    invitationId: string,
    userPhoneNumber: string,
    status: string
  ): Promise<RepositoryResponse<ResidenceMembershipInvitationWithDetails>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(`
        *,
        residence:residences(
          short_name,
          society:societies(
            name
          )
        )
      `)
      .eq("id", invitationId)
      .eq("user_phone_number", userPhoneNumber)
      .eq("status", status)
      .single();

    if (error || !data) {
      return { data: null, error };
    }

    const residence = data.residence as { short_name: string; society: { name: string } } | null;

    const result: ResidenceMembershipInvitationWithDetails = {
      id: data.id,
      user_phone_number: data.user_phone_number,
      residence_id: data.residence_id,
      role: data.role,
      status: data.status,
      auto_approve: data.auto_approve,
      invite_code: data.invite_code,
      created_at: data.created_at,
      updated_at: data.updated_at,
      residence_short_name: residence?.short_name || "Unknown",
      society_name: residence?.society?.name || "Unknown",
    };

    return { data: result, error: null };
  }

  async findByInviteCodeWithDetails(
    inviteCode: string,
    userPhoneNumber: string
  ): Promise<RepositoryResponse<InviteResponse>> {
    const { data: invitation, error: fetchError } = await supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        residence:residences(
          id,
          short_name,
          society:societies(
            id,
            name
          )
        ),
        inviter:invited_by_user(
          id,
          name
        )
      `
      )
      .eq("invite_code", inviteCode)
      .eq("user_phone_number", userPhoneNumber)
      .maybeSingle();

    if (fetchError) {
      return { data: null, error: fetchError };
    }

    if (!invitation) {
      return {
        data: null,
        error: {
          message: "Invite code not found or does not belong to you",
          details: "Invalid invite code",
          hint: null,
          code: "PGRST116",
        } as import("@supabase/supabase-js").PostgrestError,
      };
    }

    // Get inviter name from the joined data
    const inviter = invitation.inviter as { id: string; name: string } | null;
    const invitedByUserName = inviter?.name || "Unknown";

    // Transform to InviteResponse format
    const residence = invitation.residence as ResidenceWithSociety;
    const society = residence?.society as Society;

    const inviteResponse: InviteResponse = {
      id: invitation.id,
      code: invitation.invite_code,
      residenceShortName: residence?.short_name || "Unknown",
      societyName: society?.name || "Unknown",
      invitedByUserName,
      used: invitation.status !== "invited",
      expiresAt: invitation.created_at
        ? new Date(
            new Date(invitation.created_at).getTime() + 30 * 24 * 60 * 60 * 1000
          ).toISOString()
        : undefined, // 30 days from creation
      residentRole: invitation.role,
    };

    return { data: inviteResponse, error: null };
  }

  async create(invitation: {
    user_phone_number: string;
    residence_id: string;
    role: string;
    status: string;
    auto_approve: boolean;
    invite_code: string;
    invited_by_user: string;
  }): Promise<RepositoryResponse<ResidenceMembershipInvitation>> {
    return supabase_client
      .from(this.tableName)
      .insert(invitation)
      .select()
      .single();
  }

  async updateStatus(
    invitationId: string,
    status: string
  ): Promise<RepositoryResponse<null>> {
    const { error } = await supabase_client
      .from(this.tableName)
      .update({ status })
      .eq("id", invitationId);

    return { data: null, error };
  }
}

export const invitationRepository = new SupabaseInvitationRepository();
