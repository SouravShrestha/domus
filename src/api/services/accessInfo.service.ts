import { supabase_client } from "@api/client";
import { SocietyAccess, UserAccessInfo } from "@/types/models/accessInfo";

type ServiceResponse<T> = {
  data: T | null;
  error: Error | null;
};

export async function fetchUserAccessInfo(
  userId: string
): Promise<ServiceResponse<UserAccessInfo>> {
  try {
    // Fetch resident profiles
    const { data: residentProfiles, error: residentError } = await supabase_client
      .from("resident_profiles")
      .select(`
        id,
        society_id,
        residence:residences(
          id,
          society:societies(id, name)
        )
      `)
      .eq("user_id", userId);

    if (residentError) {
      return { data: null, error: new Error(residentError.message) };
    }

    // Fetch manager profiles
    const { data: managerProfiles, error: managerError } = await supabase_client
      .from("manager_profiles")
      .select(`
        id,
        society_id,
        society:societies(id, name)
      `)
      .eq("user_id", userId);

    if (managerError) {
      return { data: null, error: new Error(managerError.message) };
    }

    // Build society map
    const societyMap = new Map<string, SocietyAccess>();

    // Process resident profiles
    residentProfiles?.forEach((rp: any) => {
      const societyId = rp.residence?.society?.id;
      const societyName = rp.residence?.society?.name || "Unknown";
      if (societyId) {
        const existing = societyMap.get(societyId) || {
          societyId,
          societyName,
          isResident: false,
          isManager: false,
          hasActiveGuardDuty: false,
        };
        existing.isResident = true;
        societyMap.set(societyId, existing);
      }
    });

    // Process manager profiles
    managerProfiles?.forEach((mp: any) => {
      const societyId = mp.society_id;
      const societyName = mp.society?.name || "Unknown";
      if (societyId) {
        const existing = societyMap.get(societyId) || {
          societyId,
          societyName,
          isResident: false,
          isManager: false,
          hasActiveGuardDuty: false,
        };
        existing.isManager = true;
        societyMap.set(societyId, existing);
      }
    });

    const societies = Array.from(societyMap.values());

    // Compute aggregate roles
    const roles: ('resident' | 'manager')[] = [];
    if (societies.some(s => s.isResident)) roles.push('resident');
    if (societies.some(s => s.isManager)) roles.push('manager');

    return {
      data: {
        userId,
        roles,
        societies,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
