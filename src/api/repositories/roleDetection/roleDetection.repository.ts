import { supabase_client } from "@api/client";
import { UserType } from "@/types/models/user";
import { SocietyGuardInvite } from "@/types/models/guard";
import { SocietyManagerInvite } from "@/types/models/manager";
import {
  IRoleDetectionRepository,
  RepositoryResponse,
} from "@interfaces/roleDetection.interface";

export class RoleDetectionRepository implements IRoleDetectionRepository {
  async findGuardInviteByPhone(
    phone: string
  ): Promise<RepositoryResponse<SocietyGuardInvite>> {
    try {
      const { data, error } = await supabase_client
        .from("society_guard_invites")
        .select("*")
        .eq("phone", phone)
        .eq("status", "pending")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as SocietyGuardInvite | null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

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

  async acceptGuardInvite(
    inviteId: string,
    userId: string
  ): Promise<RepositoryResponse<void>> {
    try {
      // Get the invite details first
      const { data: invite, error: inviteError } = await supabase_client
        .from("society_guard_invites")
        .select("society_id")
        .eq("id", inviteId)
        .single();

      if (inviteError) {
        return { data: null, error: new Error(inviteError.message) };
      }

      // Create guard assignment
      const { error: assignError } = await supabase_client
        .from("society_guards")
        .insert({
          user_id: userId,
          society_id: invite.society_id,
          invite_id: inviteId,
          status: "active",
        });

      if (assignError) {
        return { data: null, error: new Error(assignError.message) };
      }

      // Update invite status
      const { error: updateError } = await supabase_client
        .from("society_guard_invites")
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
        .from("society_managers")
        .insert({
          user_id: userId,
          society_id: invite.society_id,
          invite_id: inviteId,
          role: invite.role,
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

  async updateUserType(
    userId: string,
    userType: UserType
  ): Promise<RepositoryResponse<void>> {
    try {
      const { error } = await supabase_client
        .from("user_profiles")
        .update({ user_type: userType })
        .eq("id", userId);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

export const roleDetectionRepository = new RoleDetectionRepository();

