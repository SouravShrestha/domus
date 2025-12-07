import { supabase_client } from "@api/client";
import { SocietyManager, SocietyManagerWithSociety } from "@/types/models/manager";

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
      .from("society_managers")
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
      .from("society_managers")
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
      .from("society_managers")
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

