import { ApiResponse } from "@/api/types/apiResponse";
import { SocietyManager, SocietyManagerWithSociety } from "@/types/models/manager";
import { ApprovedMembershipWithRole } from "./approvedMembership.interface";

export interface IManagerRepository {
  existsByUserId(userId: string): Promise<ApiResponse<boolean>>;
  findByUserId(userId: string): Promise<ApiResponse<SocietyManagerWithSociety[]>>;
  findByUserIdAndSociety(
    userId: string,
    societyId: string
  ): Promise<ApiResponse<SocietyManager>>;
  findByUserIdAsResidences(
    userId: string
  ): Promise<ApiResponse<ApprovedMembershipWithRole[]>>;
}

export interface IManagerService {
  checkIfUserIsManager(userId: string): Promise<ApiResponse<boolean>>;
  getManagerSocieties(userId: string): Promise<ApiResponse<SocietyManagerWithSociety[]>>;
  getManagerAssignment(userId: string, societyId: string): Promise<ApiResponse<SocietyManager>>;
  getManagerSocietiesAsResidences(userId: string): Promise<ApiResponse<ApprovedMembershipWithRole[]>>;
}
