import { supabase_client } from "@api/client";
import { SocietyManagerInvite } from "@/types/models/manager";
import {
  IRoleDetectionRepository,
  RepositoryResponse,
} from "@interfaces/roleDetection.interface";

export class RoleDetectionRepository implements IRoleDetectionRepository {
  
  async findManagerInviteByPhone(
    phone: string
  ): Promise<RepositoryResponse<SocietyManagerInvite>> {
    try {
      const { data, error } = await supabase_client
        .from("society_manager_invites")
        .select("*")
        .eq("phone", phone)
        .eq("status", "pending")
        .single();

      if (error && error.code !== "PGRST116") {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as SocietyManagerInvite | null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
  async acceptManagerInvite(
    inviteId: string,
    userId: string
  ): Promise<RepositoryResponse<void>> {
    try {
      // Get the invite details first
      const { data: invite, error: inviteError } = await supabase_client
        .from("society_manager_invites")
        .select("society_id, role")
        .eq("id", inviteId)
        .single();

      if (inviteError) {
        return { data: null, error: new Error(inviteError.message) };
      }

      // Create manager assignment
      const { error: assignError } = await supabase_client
        .from("manager_profiles")
        .insert({
          user_id: userId,
          society_id: invite.society_id,
          invite_id: inviteId,
        });

      if (assignError) {
        return { data: null, error: new Error(assignError.message) };
      }

      // Update invite status
      const { error: updateError } = await supabase_client
        .from("society_manager_invites")
        .update({ status: "accepted" })
        .eq("id", inviteId);

      if (updateError) {
        return { data: null, error: new Error(updateError.message) };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

}

export const roleDetectionRepository = new RoleDetectionRepository();

