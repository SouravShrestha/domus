import { supabase_client } from "../../client";
import {
  IManagerDashboardRepository,
  AttentionItem,
  SocietyActivity,
} from "@interfaces/managerDashboard.interface";
import { RepositoryResponse } from "@interfaces/profile.interface";

export class ManagerDashboardRepository implements IManagerDashboardRepository {
  async getTotalResidents(societyId: string): Promise<RepositoryResponse<number>> {
    const { count, error } = await supabase_client
      .from("resident_profiles")
      .select("id, residence:residences!inner(society_id)", { count: "exact", head: true })
      .eq("residence.society_id", societyId);

    return { data: count || 0, error };
  }

  async getActiveVisitors(societyId: string): Promise<RepositoryResponse<number>> {
    const now = new Date().toISOString();

    const { count, error } = await supabase_client
      .from("guest_invitations")
      .select("id, residence:residences!inner(society_id)", { count: "exact", head: true })
      .eq("residence.society_id", societyId)
      .eq("status", "active")
      .lte("valid_from", now)
      .gte("valid_until", now);

    return { data: count || 0, error };
  }

  async getOpenComplaints(societyId: string): Promise<RepositoryResponse<number>> {
    const { count, error } = await supabase_client
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .eq("society_id", societyId)
      .eq("status", "open");

    return { data: count || 0, error };
  }

  async getCurrentBookings(societyId: string): Promise<RepositoryResponse<number>> {
    const now = new Date().toISOString();
    
    const { count, error } = await supabase_client
      .from("maintenance_updates")
      .select("id", { count: "exact", head: true })
      .eq("society_id", societyId)
      .gte("scheduled_date", now);

    return { data: count || 0, error };
  }

  async getPendingApprovals(societyId: string): Promise<RepositoryResponse<AttentionItem[]>> {
    const { data, error } = await supabase_client
      .from("pending_residence_memberships")
      .select(`
        id,
        status,
        created_at,
        role,
        user:user_profiles!inner(name, phone),
        residence:residences!inner(short_name, society_id)
      `)
      .eq("residence.society_id", societyId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !data) {
      return { data: [], error };
    }

    const attentionItems: AttentionItem[] = data.map((item: any) => ({
      id: item.id,
      type: "pending_approval" as const,
      title: `${item.user?.name || "Unknown"} - ${item.role}`,
      description: `Pending approval for ${item.residence?.short_name || "Unknown"}`,
      timestamp: item.created_at,
      priority: "high" as const,
      metadata: {
        userId: item.user_id,
        residenceShortName: item.residence?.short_name,
        role: item.role,
        phone: item.user?.phone,
      },
    }));

    return { data: attentionItems, error: null };
  }

  async getOpenComplaintsForAttention(societyId: string): Promise<RepositoryResponse<AttentionItem[]>> {
    const { data, error } = await supabase_client
      .from("complaints")
      .select(`
        id,
        title,
        description,
        category,
        created_at,
        raised_by_name,
        level,
        residence:residences(short_name)
      `)
      .eq("society_id", societyId)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !data) {
      return { data: [], error };
    }

    const attentionItems: AttentionItem[] = data.map((item: any) => ({
      id: item.id,
      type: "open_complaint" as const,
      title: item.title,
      description: item.description || `${item.category} complaint`,
      timestamp: item.created_at,
      priority: "medium" as const,
      metadata: {
        category: item.category,
        level: item.level,
        raisedByName: item.raised_by_name,
        residenceShortName: item.residence?.short_name,
      },
    }));

    return { data: attentionItems, error: null };
  }

  async getRecentActivities(
    societyId: string,
    limit: number = 20
  ): Promise<RepositoryResponse<SocietyActivity[]>> {
    const { data, error } = await supabase_client
      .from("activity_logs")
      .select(`
        id,
        action_type,
        target_identifier,
        metadata,
        created_at,
        actor:actor_user_id(name, photo_url),
        residence:residences!inner(short_name, society_id)
      `)
      .eq("residence.society_id", societyId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      return { data: [], error };
    }

    const activities: SocietyActivity[] = data.map((item: any) => ({
      id: item.id,
      type: item.action_type,
      title: formatActivityTitle(item.action_type),
      description: item.target_identifier || "",
      timestamp: item.created_at,
      actorName: item.actor?.name,
      actorPhotoUrl: item.actor?.photo_url,
      metadata: {
        ...item.metadata,
        residenceShortName: item.residence?.short_name,
      },
    }));

    return { data: activities, error: null };
  }
}

function formatActivityTitle(actionType: string): string {
  const titles: Record<string, string> = {
    guest_invited: "New visitor invited",
    guest_entry: "Visitor entered",
    guest_exit: "Visitor exited",
    guest_invitation_cancelled: "Invitation cancelled",
    member_joined: "New member joined",
    member_left: "Member left",
    guard_invited: "Guard invited",
    complaint_raised: "Complaint raised",
    complaint_resolved: "Complaint resolved",
  };
  return titles[actionType] || actionType.replace(/_/g, " ");
}

export const managerDashboardRepository = new ManagerDashboardRepository();
