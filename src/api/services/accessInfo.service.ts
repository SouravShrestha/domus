import { IAccessInfoRepository, IAccessInfoService } from "@interfaces/accessInfo.interface";
import { accessInfoRepository } from "@repositories/accessInfo/accessInfo.repository";
import { ApiResponse } from "@/api/types/apiResponse";
import { UserAccessInfo } from "@/types/models/accessInfo";

export class AccessInfoService implements IAccessInfoService {
  constructor(private readonly accessInfoRepo: IAccessInfoRepository) {}

  async fetchUserAccessInfo(
    userId: string
  ): Promise<ApiResponse<UserAccessInfo>> {
    return this.accessInfoRepo.fetchUserAccessInfo(userId);
  }
}

const accessInfoService = new AccessInfoService(accessInfoRepository);

export const fetchUserAccessInfo = (userId: string) =>
  accessInfoService.fetchUserAccessInfo(userId);

export { accessInfoService };
