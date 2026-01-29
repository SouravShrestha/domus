import { supabase_client } from "../../client";
import {
  IResidenceRepository,
  ResidenceMembersResponse,
  ResidenceWithMembers,
} from "@interfaces/residence.interface";
import { RepositoryResponse } from "@interfaces/profile.interface";
import { ResidenceWithSociety, ResidenceWithOccupancy } from "@/types/api/response/residence";

type ResidenceWithMembershipCount = ResidenceWithSociety & {
  resident_profiles: [{ count: number }];
};

export class SupabaseResidenceRepository implements IResidenceRepository {
  private readonly tableName = "residences";

  async findByIdWithSociety(
    residenceId: string
  ): Promise<RepositoryResponse<ResidenceWithSociety>> {
    return supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        society:societies(*)
      `
      )
      .eq("id", residenceId)
      .single();
  }

  async findMembersByResidenceId(
    residenceId: string
  ): Promise<RepositoryResponse<ResidenceMembersResponse>> {
    try {
      const { data: approvedData, error: approvedError } = await supabase_client
        .from("resident_profiles")
        .select(
          `
          id,
          user_id,
          role,
          created_at,
          user:user_profiles!inner(
            id,
            name,
            phone,
            photo_url
          )
        `
        )
        .eq("residence_id", residenceId)
        .order("created_at", { ascending: true });

      if (approvedError) {
        return { data: null, error: approvedError };
      }

      const { data: pendingData, error: pendingError } = await supabase_client
        .from("residence_membership_invitations")
        .select(
          `
          id,
          user_phone_number,
          role,
          status,
          invite_code,
          invitee_name,
          created_at,
          updated_at
        `
        )
        .eq("residence_id", residenceId)
        .eq("status", "invited")
        .order("created_at", { ascending: false });

      if (pendingError) {
        return { data: null, error: pendingError };
      }

      const approved = (approvedData || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        role: item.role,
        created_at: item.created_at,
        user: item.user,
      }));

      const pending = (pendingData || []).map((item: any) => ({
        id: item.id,
        user_phone_number: item.user_phone_number,
        role: item.role,
        status: item.status,
        invite_code: item.invite_code,
        invitee_name: item.invitee_name,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      return {
        data: { approved, pending },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as any,
      };
    }
  }

  async findAllBySocietyId(
    societyId: string,
    block?: string
  ): Promise<RepositoryResponse<ResidenceWithOccupancy[]>> {
    let query = supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        society:societies(*),
        resident_profiles(count)
      `
      )
      .eq("society_id", societyId)
      .order("floor_number", { ascending: true })
      .order("flat_number", { ascending: true });

    if (block) {
      query = query.eq("block", block);
    }

    const { data, error } = await query.returns<ResidenceWithMembershipCount[]>();

    if (error || !data) {
      return { data: null, error };
    }

    const residencesWithOccupancy: ResidenceWithOccupancy[] = data.map((r) => {
      const membershipCount = r.resident_profiles?.[0]?.count ?? 0;
      const { resident_profiles: _memberships, ...residence } = r;
      return {
        ...residence,
        is_occupied: membershipCount > 0,
        approved_membership_count: membershipCount,
      };
    });

    return { data: residencesWithOccupancy, error: null };
  }

  async findByIdWithMembers(
    residenceId: string
  ): Promise<RepositoryResponse<ResidenceWithMembers>> {
    try {
      // Fetch residence with society
      const { data: residence, error: residenceError } =
        await this.findByIdWithSociety(residenceId);

      if (residenceError || !residence) {
        return { data: null, error: residenceError };
      }

      // Fetch members
      const { data: membersData, error: membersError } =
        await this.findMembersByResidenceId(residenceId);

      if (membersError) {
        return { data: null, error: membersError };
      }

      // Check if there's an owner
      const hasOwner =
        membersData?.approved.some(
          (member) => member.role.toLowerCase() === "owner"
        ) || false;

      return {
        data: {
          residence,
          hasOwner,
          members: membersData?.approved || [],
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as any,
      };
    }
  }

  async searchBySocietyAndFlatNumber(
    societyId: string,
    searchTerm: string
  ): Promise<RepositoryResponse<ResidenceWithSociety[]>> {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        society:societies(*)
      `
      )
      .eq("society_id", societyId)
      .or(
        `flat_number.ilike.%${normalizedSearch}%,block.ilike.%${normalizedSearch}%,short_name.ilike.%${normalizedSearch}%`
      )
      .order("flat_number", { ascending: true })
      .limit(20);

    return { data, error };
  }

  async searchBySocietyAndResidentName(
    societyId: string,
    searchTerm: string
  ): Promise<RepositoryResponse<ResidenceWithSociety[]>> {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    // Search for residences where a member's name matches the search term
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        society:societies(*),
        resident_profiles!inner(
          user:user_profiles!inner(
            id,
            name,
            phone,
            photo_url
          )
        )
      `
      )
      .eq("society_id", societyId)
      .ilike(
        "resident_profiles.user.name",
        `%${normalizedSearch}%`
      )
      .order("flat_number", { ascending: true })
      .limit(20);

    if (error) {
      return { data: null, error };
    }

    // Remove duplicates and format the response
    const uniqueResidences = data?.reduce((acc: any[], curr: any) => {
      if (!acc.find((r: any) => r.id === curr.id)) {
        // Remove the resident_profiles from the response
        const { resident_profiles: _profiles, ...residence } = curr;
        acc.push(residence);
      }
      return acc;
    }, []);

    return { data: uniqueResidences || [], error: null };
  }

  async convertOwnerToAdult(
    membershipId: string
  ): Promise<RepositoryResponse<null>> {
    const { error } = await supabase_client
      .from("resident_profiles")
      .update({ role: "adult" })
      .eq("id", membershipId);

    return { data: null, error };
  }
}

export const residenceRepository = new SupabaseResidenceRepository();
