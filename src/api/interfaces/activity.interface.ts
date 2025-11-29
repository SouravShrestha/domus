import { RepositoryResponse } from "./profile.interface";
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
  ): Promise<RepositoryResponse<ActivityLogWithActor[]>>;

  create(
    residenceId: string,
    actorUserId: string,
    actionType: ActivityType,
    targetIdentifier?: string,
    metadata?: ActivityLogMetadata
  ): Promise<RepositoryResponse<ActivityLog>>;

  findByResidenceId(
    residenceId: string,
    skip?: number,
    take?: number
  ): Promise<RepositoryResponse<ActivityLogWithActor[]>>;
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
  ): Promise<RepositoryResponse<ActivityLog>>;

  getResidenceActivities(
    residenceId: string,
    skip?: number,
    take?: number
  ): Promise<ActivityLogWithActor[]>;
}
