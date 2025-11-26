import { PostgrestError } from "@supabase/supabase-js";
import { supabase_client } from "../client";
import { ActivityLog, ActivityLogWithActor, ActivityType, ActivityLogMetadata } from "../types/models/activity";

export const logActivity = async (
  residenceId: string,
  actorUserId: string,
  actionType: ActivityType,
  targetIdentifier?: string,
  metadata: ActivityLogMetadata = {}
): Promise<{ data: ActivityLog | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase_client
    .from("activity_logs")
    .insert({
      residence_id: residenceId,
      actor_user_id: actorUserId,
      action_type: actionType,
      target_identifier: targetIdentifier,
      metadata: metadata,
    })
    .select()
    .single();

  if (error) {
    console.error("Error logging activity:", error);
  }

  return { data, error };
};

export const fetchResidenceActivities = async (
  residenceId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ data: ActivityLogWithActor[] | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase_client
    .from("activity_logs")
    .select(`
      *,
      actor:actor_user_id (
        id,
        name,
        phone,
        avatar_url
      )
    `)
    .eq("residence_id", residenceId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return { data: data as ActivityLogWithActor[] | null, error };
};


