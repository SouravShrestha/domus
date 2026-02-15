import { ApiResponse } from "@/api/types/apiResponse";
import { UserAccessInfo } from "@/types/models/accessInfo";

export interface IAccessInfoRepository {
  fetchUserAccessInfo(userId: string): Promise<ApiResponse<UserAccessInfo>>;
}

export interface IAccessInfoService {
  fetchUserAccessInfo(userId: string): Promise<ApiResponse<UserAccessInfo>>;
}
