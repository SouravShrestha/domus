import { 
  ActivityLog, 
  ActivityLogWithActor, 
  ActivityType, 
  ActivityLogMetadata 
} from "@models/activity";
import { activityRepository } from "@repositories/activity/activity.repository";
import { IActivityRepository, IActivityService } from "@interfaces/activity.interface";
import { ApiResponse } from "@/api/types/apiResponse";
import { getCurrentUserId } from '@/api/utils/getCurrentUser';
import { apiLogger } from '@/api/utils/logger';

const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 10;

export class ActivityService implements IActivityService {
  constructor(private readonly activityRepo: IActivityRepository) {}

  async getMyActivities(
    skip: number = DEFAULT_SKIP,
    take: number = DEFAULT_TAKE
  ): Promise<ActivityLogWithActor[]> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      apiLogger.error("ActivityService", "Failed to get current user");
      return [];
    }

    const { data, error } = await this.activityRepo.findByUserId(userId, skip, take);

    if (error) {
      apiLogger.error("ActivityService", "Failed to fetch activities", error);
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
      apiLogger.error("ActivityService", "Failed to fetch residence activities", error);
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
  ): Promise<ApiResponse<ActivityLog>> {
    const result = await this.activityRepo.create(
      residenceId,
      actorUserId,
      actionType,
      targetIdentifier,
      metadata
    );

    if (result.error) {
      apiLogger.error("ActivityService", "Failed to log activity", result.error);
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


