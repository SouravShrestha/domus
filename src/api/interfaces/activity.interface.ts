import { ApiResponse } from "@/api/types/apiResponse";
import { 
  ActivityLog, 
  ActivityLogWithActor, 
  ActivityType, 
  ActivityLogMetadata 
} from "@models/activity";

export interface IActivityRepository {
  findByUserId(
    userId: string,
    skip?: number,
    take?: number
  ): Promise<ApiResponse<ActivityLogWithActor[]>>;

  create(
    residenceId: string,
    actorUserId: string,
    actionType: ActivityType,
    targetIdentifier?: string,
    metadata?: ActivityLogMetadata
  ): Promise<ApiResponse<ActivityLog>>;

  findByResidenceId(
    residenceId: string,
    skip?: number,
    take?: number
  ): Promise<ApiResponse<ActivityLogWithActor[]>>;
}

export interface IActivityService {
  getMyActivities(
    skip?: number,
    take?: number
  ): Promise<ActivityLogWithActor[]>;

  logActivity(
    residenceId: string,
    actorUserId: string,
    actionType: ActivityType,
    targetIdentifier?: string,
    metadata?: ActivityLogMetadata
  ): Promise<ApiResponse<ActivityLog>>;

  getResidenceActivities(
    residenceId: string,
    skip?: number,
    take?: number
  ): Promise<ActivityLogWithActor[]>;
}
