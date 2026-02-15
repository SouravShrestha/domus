import { supabase_client } from "../../client";
import { IAccessInfoRepository } from "@interfaces/accessInfo.interface";
import { ApiResponse } from "@/api/types/apiResponse";
import { SocietyAccess, UserAccessInfo } from "@/types/models/accessInfo";

export class SupabaseAccessInfoRepository implements IAccessInfoRepository {
  async fetchUserAccessInfo(
    userId: string
  ): Promise<ApiResponse<UserAccessInfo>> {
    try {
      const [residentResult, managerResult, guardResult] = await Promise.all([
        supabase_client
          .from("resident_profiles")
          .select(`
            id,
            society_id,
            residence:residences(
              id,
              society:societies(id, name)
            )
          `)
          .eq("user_id", userId),
        supabase_client
          .from("manager_profiles")
          .select(`
            id,
            society_id,
            society:societies(id, name)
          `)
          .eq("user_id", userId),
        supabase_client
          .from("guard_profiles")
          .select(`
            id,
            society_id,
            society:societies(id, name)
          `)
          .eq("user_id", userId),
      ]);

      if (residentResult.error) {
        return { data: null, error: residentResult.error };
      }
      if (managerResult.error) {
        return { data: null, error: managerResult.error };
      }
      if (guardResult.error) {
        return { data: null, error: guardResult.error };
      }

      const guardProfileIds = guardResult.data?.map((gp: any) => gp.id) || [];

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

      const societyMap = new Map<string, SocietyAccess>();

      residentResult.data?.forEach((rp: any) => {
        const societyId = rp.residence?.society?.id;
        const societyName = rp.residence?.society?.name || "Unknown";
        if (societyId) {
          const existing = societyMap.get(societyId) || this.createDefaultAccess(societyId, societyName);
          existing.isResident = true;
          societyMap.set(societyId, existing);
        }
      });

      managerResult.data?.forEach((mp: any) => {
        const societyId = mp.society_id;
        const societyName = mp.society?.name || "Unknown";
        if (societyId) {
          const existing = societyMap.get(societyId) || this.createDefaultAccess(societyId, societyName);
          existing.isManager = true;
          societyMap.set(societyId, existing);
        }
      });

      guardResult.data?.forEach((gp: any) => {
        const societyId = gp.society_id;
        const societyName = gp.society?.name || "Unknown";
        if (societyId) {
          const existing = societyMap.get(societyId) || this.createDefaultAccess(societyId, societyName);
          existing.isGuard = true;
          existing.hasActiveGuardDuty = activeGuardSocieties.has(societyId);
          societyMap.set(societyId, existing);
        }
      });

      const societies = Array.from(societyMap.values());
      const roles: ("resident" | "manager" | "guard")[] = [];
      if (societies.some((s) => s.isResident)) roles.push("resident");
      if (societies.some((s) => s.isManager)) roles.push("manager");
      if (societies.some((s) => s.isGuard)) roles.push("guard");

      return {
        data: { userId, roles, societies },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as any };
    }
  }

  private createDefaultAccess(societyId: string, societyName: string): SocietyAccess {
    return {
      societyId,
      societyName,
      isResident: false,
      isManager: false,
      isGuard: false,
      hasActiveGuardDuty: false,
    };
  }
}

export const accessInfoRepository = new SupabaseAccessInfoRepository();
