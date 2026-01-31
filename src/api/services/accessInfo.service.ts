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

    // Fetch guard profiles
    const { data: guardProfiles, error: guardError } = await supabase_client
      .from("guard_profiles")
      .select(`
        id,
        society_id,
        society:societies(id, name)
      `)
      .eq("user_id", userId);

    if (guardError) {
      return { data: null, error: new Error(guardError.message) };
    }

    // Get guard profile IDs for this user first
    const guardProfileIds = guardProfiles?.map((gp: any) => gp.id) || [];

    // Fetch active guard assignments using guard_profile_id
    let guardAssignments: { society_id: string }[] = [];
    if (guardProfileIds.length > 0) {
      const { data: assignments, error: assignmentError } = await supabase_client
        .from("guard_assignments")
        .select("society_id")
        .in("guard_profile_id", guardProfileIds)
        .in("status", ["scheduled", "active"]);

      if (assignmentError) {
        console.error("[AccessInfo] Error fetching guard assignments:", assignmentError);
      }
      guardAssignments = assignments || [];
    }

    const activeGuardSocieties = new Set(
      guardAssignments.map((a) => a.society_id)
    );

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
          isGuard: false,
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
          isGuard: false,
          hasActiveGuardDuty: false,
        };
        existing.isManager = true;
        societyMap.set(societyId, existing);
      }
    });

    // Process guard profiles
    guardProfiles?.forEach((gp: any) => {
      const societyId = gp.society_id;
      const societyName = gp.society?.name || "Unknown";
      if (societyId) {
        const existing = societyMap.get(societyId) || {
          societyId,
          societyName,
          isResident: false,
          isManager: false,
          isGuard: false,
          hasActiveGuardDuty: false,
        };
        existing.isGuard = true;
        existing.hasActiveGuardDuty = activeGuardSocieties.has(societyId);
        societyMap.set(societyId, existing);
      }
    });

    const societies = Array.from(societyMap.values());

    // Compute aggregate roles
    const roles: ('resident' | 'manager' | 'guard')[] = [];
    if (societies.some(s => s.isResident)) roles.push('resident');
    if (societies.some(s => s.isManager)) roles.push('manager');
    if (societies.some(s => s.isGuard)) roles.push('guard');

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
