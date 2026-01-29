import { supabase_client } from "@api/client";
import {
  GuardInvite,
  GuardProfile,
  GuardProfileWithSociety,
  GuardAssignment,
  GuardAssignmentWithSociety,
  GuardRole,
} from "@/types/models/guard";
import {
  IGuardRepository,
  RepositoryResponse,
  GuardInviteResponse,
} from "@interfaces/guard.interface";

export class GuardRepository implements IGuardRepository {
  async findInviteByPhone(
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

  async findInviteByCode(
    inviteCode: string
  ): Promise<RepositoryResponse<GuardInvite>> {
    try {
      const { data, error } = await supabase_client
        .from("guard_invites")
        .select("*")
        .eq("invite_code", inviteCode)
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

  async findInviteByCodeWithDetails(
    inviteCode: string,
    userPhone: string
  ): Promise<RepositoryResponse<GuardInviteResponse>> {
    try {
      const { data, error } = await supabase_client
        .from("guard_invites")
        .select(`
          id,
          role,
          society:societies(
            id,
            name,
            image_url
          ),
          inviter:user_profiles!guard_invites_added_by_fkey(
            name
          )
        `)
        .eq("invite_code", inviteCode)
        .eq("phone", userPhone)
        .eq("status", "pending")
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      if (!data) {
        return { data: null, error: null };
      }

      const society = data.society as any;
      const inviter = data.inviter as any;

      return {
        data: {
          id: data.id,
          society_name: society?.name || "Unknown",
          society_image_url: society?.image_url,
          role: data.role as GuardRole,
          inviter_name: inviter?.name,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async findActiveInviteByPhoneAndSociety(
    phone: string,
    societyId: string
  ): Promise<RepositoryResponse<Pick<GuardInvite, "id">>> {
    try {
      const { data, error } = await supabase_client
        .from("guard_invites")
        .select("id")
        .eq("phone", phone)
        .eq("society_id", societyId)
        .eq("status", "pending")
        .single();

      if (error && error.code !== "PGRST116") {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async createInvite(invite: {
    society_id: string;
    phone: string;
    name?: string;
    role: GuardRole;
    added_by: string;
    invite_code: string;
  }): Promise<RepositoryResponse<GuardInvite>> {
    try {
      const { data, error } = await supabase_client
        .from("guard_invites")
        .insert(invite)
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as GuardInvite, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateInviteStatus(
    inviteId: string,
    status: string
  ): Promise<RepositoryResponse<null>> {
    try {
      const { error } = await supabase_client
        .from("guard_invites")
        .update({ status })
        .eq("id", inviteId);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteInvite(inviteId: string): Promise<RepositoryResponse<null>> {
    try {
      const { error } = await supabase_client
        .from("guard_invites")
        .delete()
        .eq("id", inviteId);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async acceptInvite(
    inviteId: string,
    userId: string,
    societyId: string
  ): Promise<RepositoryResponse<GuardProfile>> {
    try {
      const { data: profile, error: profileError } = await supabase_client
        .from("guard_profiles")
        .insert({
          user_id: userId,
          society_id: societyId,
          invite_id: inviteId,
        })
        .select()
        .single();

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

      return { data: profile as GuardProfile, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async findGuardProfile(
    userId: string,
    societyId: string
  ): Promise<RepositoryResponse<GuardProfile>> {
    try {
      const { data, error } = await supabase_client
        .from("guard_profiles")
        .select("*")
        .eq("user_id", userId)
        .eq("society_id", societyId)
        .single();

      if (error && error.code !== "PGRST116") {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as GuardProfile | null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getGuardProfiles(
    userId: string
  ): Promise<RepositoryResponse<GuardProfileWithSociety[]>> {
    try {
      const { data, error } = await supabase_client
        .from("guard_profiles")
        .select(`
          *,
          society:societies(id, name, code, image_url)
        `)
        .eq("user_id", userId);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as GuardProfileWithSociety[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getGuardsBySociety(
    societyId: string
  ): Promise<RepositoryResponse<(GuardProfile & { user: { id: string; name: string; phone: string; photo_url?: string } })[]>> {
    try {
      const { data, error } = await supabase_client
        .from("guard_profiles")
        .select(`
          *,
          user:user_profiles(id, name, phone, photo_url)
        `)
        .eq("society_id", societyId);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as any, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getAssignments(
    userId: string,
    societyId?: string
  ): Promise<RepositoryResponse<GuardAssignmentWithSociety[]>> {
    try {
      let query = supabase_client
        .from("guard_assignments")
        .select(`
          *,
          society:societies(id, name, code, image_url)
        `)
        .eq("user_id", userId)
        .eq("is_active", true);

      if (societyId) {
        query = query.eq("society_id", societyId);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as GuardAssignmentWithSociety[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async createOrUpdateAssignment(assignment: {
    user_id: string;
    society_id: string;
    role: GuardRole;
    shift_start?: string;
    shift_end?: string;
    valid_from?: string;
    valid_till?: string;
    is_active?: boolean;
  }): Promise<RepositoryResponse<GuardAssignment>> {
    try {
      const { data, error } = await supabase_client
        .from("guard_assignments")
        .upsert(assignment, {
          onConflict: "user_id,society_id",
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as GuardAssignment, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getInvitesBySociety(
    societyId: string
  ): Promise<RepositoryResponse<GuardInvite[]>> {
    try {
      const { data, error } = await supabase_client
        .from("guard_invites")
        .select("*")
        .eq("society_id", societyId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as GuardInvite[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async createGuardProfileDirect(
    userId: string,
    societyId: string
  ): Promise<RepositoryResponse<GuardProfile>> {
    try {
      const { data: profile, error } = await supabase_client
        .from("guard_profiles")
        .insert({
          user_id: userId,
          society_id: societyId,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: profile as GuardProfile, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

export const guardRepository = new GuardRepository();

