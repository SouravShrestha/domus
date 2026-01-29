import { supabase_client } from "@api/client";
import { SocietyManager, SocietyManagerWithSociety } from "@/types/models/manager";
import { ApprovedMembershipWithRole } from "@interfaces/approvedMembership.interface";

type RepositoryResponse<T> = {
  data: T | null;
  error: Error | null;
};

/**
 * Check if a user is a manager of any society
 */
export async function checkIfUserIsManager(
  userId: string
): Promise<RepositoryResponse<boolean>> {
  try {
    const { data, error } = await supabase_client
      .from("manager_profiles")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data && data.length > 0, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Get all societies a user manages
 */
export async function getManagerSocieties(
  userId: string
): Promise<RepositoryResponse<SocietyManagerWithSociety[]>> {
  try {
    const { data, error } = await supabase_client
      .from("manager_profiles")
      .select(`
        *,
        society:societies(id, name, code, image_url)
      `)
      .eq("user_id", userId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as SocietyManagerWithSociety[], error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Get a specific manager assignment
 */
export async function getManagerAssignment(
  userId: string,
  societyId: string
): Promise<RepositoryResponse<SocietyManager>> {
  try {
    const { data, error } = await supabase_client
      .from("manager_profiles")
      .select("*")
      .eq("user_id", userId)
      .eq("society_id", societyId)
      .single();

    if (error && error.code !== "PGRST116") {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as SocietyManager | null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Get manager societies formatted as residence memberships for use with residence context
 * This allows managers to use the residence context infrastructure
 */
export async function getManagerSocietiesAsResidences(
  userId: string
): Promise<RepositoryResponse<ApprovedMembershipWithRole[]>> {
  try {
    const { data, error } = await supabase_client
      .from("manager_profiles")
      .select(`
        id,
        society_id,
        society:societies(
          id,
          name,
          code,
          image_url,
          created_at
        )
      `)
      .eq("user_id", userId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    const formattedData: ApprovedMembershipWithRole[] = data.map((manager: any) => ({
      id: manager.id,
      role: "manager" as const,
      residence: {
        id: manager.society_id,
        society_id: manager.society.id,
        flat_number: null,
        building_name: null,
        floor: null,
        wing: null,
        created_at: manager.society.created_at,
        society: {
          id: manager.society.id,
          name: manager.society.name,
          code: manager.society.code,
          image_url: manager.society.image_url,
        },
      },
    }));

    return { data: formattedData, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
