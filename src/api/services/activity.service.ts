import { 
  ActivityLog, 
  ActivityLogWithActor, 
  ActivityType, 
  ActivityLogMetadata 
} from "@models/activity";
import { activityRepository } from "@repositories/activity/activity.repository";
import { IActivityRepository, IActivityService } from "@interfaces/activity.interface";
import { RepositoryResponse } from "@interfaces/profile.interface";
import { supabase_client } from "../client";

const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 10;

export class ActivityService implements IActivityService {
  constructor(private readonly activityRepo: IActivityRepository) {}

  async getMyActivities(
    skip: number = DEFAULT_SKIP,
    take: number = DEFAULT_TAKE
  ): Promise<ActivityLogWithActor[]> {
    // Get current user
    const { data: { user }, error: userError } = await supabase_client.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      return [];
    }

    const { data, error } = await this.activityRepo.findByUserId(user.id, skip, take);

    if (error) {
      console.error("Error fetching activities:", error);
      return [];
    }

    return data || [];
  }

  async getResidenceActivities(
    residenceId: string,
    skip: number = DEFAULT_SKIP,
    take: number = DEFAULT_TAKE
  ): Promise<ActivityLogWithActor[]> {
    const { data, error } = await this.activityRepo.findByResidenceId(
      residenceId,
      skip,
      take
    );

    if (error) {
      console.error("Error fetching residence activities:", error);
      return [];
    }

    return data || [];
  }

  async logActivity(
    residenceId: string,
    actorUserId: string,
    actionType: ActivityType,
    targetIdentifier?: string,
    metadata?: ActivityLogMetadata
  ): Promise<RepositoryResponse<ActivityLog>> {
    const result = await this.activityRepo.create(
      residenceId,
      actorUserId,
      actionType,
      targetIdentifier,
      metadata
    );

    if (result.error) {
      console.error("Error logging activity:", result.error);
    }

    return result;
  }
}

const activityServiceInstance = new ActivityService(activityRepository);

// Export convenience functions
export const getMyActivities = (skip?: number, take?: number) =>
  activityServiceInstance.getMyActivities(skip, take);

export const getResidenceActivities = (
  residenceId: string,
  skip?: number,
  take?: number
) => activityServiceInstance.getResidenceActivities(residenceId, skip, take);

export const logActivity = (
  residenceId: string,
  actorUserId: string,
  actionType: ActivityType,
  targetIdentifier?: string,
  metadata?: ActivityLogMetadata
) =>
  activityServiceInstance.logActivity(
    residenceId,
    actorUserId,
    actionType,
    targetIdentifier,
    metadata
  );

// Legacy function name for backward compatibility
export const fetchResidenceActivities = getResidenceActivities;

export { activityServiceInstance as activityService };


