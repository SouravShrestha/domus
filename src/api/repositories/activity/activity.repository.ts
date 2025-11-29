import { supabase_client } from "../../client";
import { IActivityRepository } from "@interfaces/activity.interface";
import { RepositoryResponse } from "@interfaces/profile.interface";
import { 
  ActivityLog, 
  ActivityLogWithActor, 
  ActivityType, 
  ActivityLogMetadata 
} from "@models/activity";

export class SupabaseActivityRepository implements IActivityRepository {
  private readonly tableName = "activity_logs";

  async findByUserId(
    userId: string,
    skip: number = 0,
    take: number = 10
  ): Promise<RepositoryResponse<ActivityLogWithActor[]>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(`
        *,
        actor:actor_user_id (
          id,
          name,
          phone,
          photo_url
        )
      `)
      .eq("actor_user_id", userId)
      .order("created_at", { ascending: false })
      .range(skip, skip + take - 1);

    return { 
      data: data as ActivityLogWithActor[] | null, 
      error 
    };
  }

  async findByResidenceId(
    residenceId: string,
    skip: number = 0,
    take: number = 10
  ): Promise<RepositoryResponse<ActivityLogWithActor[]>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(`
        *,
        actor:actor_user_id (
          id,
          name,
          phone,
          photo_url
        )
      `)
      .eq("residence_id", residenceId)
      .order("created_at", { ascending: false })
      .range(skip, skip + take - 1);

    return { 
      data: data as ActivityLogWithActor[] | null, 
      error 
    };
  }

  async create(
    residenceId: string,
    actorUserId: string,
    actionType: ActivityType,
    targetIdentifier?: string,
    metadata: ActivityLogMetadata = {}
  ): Promise<RepositoryResponse<ActivityLog>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .insert({
        residence_id: residenceId,
        actor_user_id: actorUserId,
        action_type: actionType,
        target_identifier: targetIdentifier,
        metadata: metadata,
      })
      .select()
      .single();

    return { data, error };
  }
}

export const activityRepository = new SupabaseActivityRepository();
