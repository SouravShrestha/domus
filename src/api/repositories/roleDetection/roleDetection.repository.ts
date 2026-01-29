import { supabase_client } from "@api/client";
import { SocietyManagerInvite } from "@/types/models/manager";
import { GuardInvite } from "@/types/models/guard";
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
      const { data: invite, error: inviteError } = await supabase_client
        .from("society_manager_invites")
        .select("society_id, role")
        .eq("id", inviteId)
        .single();

      if (inviteError) {
        return { data: null, error: new Error(inviteError.message) };
      }

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

  async findGuardInviteByPhone(
    phone: string
  ): Promise<RepositoryResponse<GuardInvite>> {
    try {
      const { data, error } = await supabase_client
        .from("guard_invites")
        .select("*")
        .eq("phone", phone)
        .eq("status", "pending")
        .single();

      if (error && error.code !== "PGRST116") {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as GuardInvite | null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async acceptGuardInvite(
    inviteId: string,
    userId: string,
    societyId: string
  ): Promise<RepositoryResponse<void>> {
    try {
      const { error: profileError } = await supabase_client
        .from("guard_profiles")
        .insert({
          user_id: userId,
          society_id: societyId,
          invite_id: inviteId,
        });

      if (profileError) {
        return { data: null, error: new Error(profileError.message) };
      }

      const { error: updateError } = await supabase_client
        .from("guard_invites")
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
