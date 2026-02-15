import { IManagerRepository, IManagerService } from "@interfaces/manager.interface";
import { managerRepository } from "@repositories/manager/manager.repository";
import { ApiResponse } from "@/api/types/apiResponse";
import { SocietyManager, SocietyManagerWithSociety } from "@/types/models/manager";
import { ApprovedMembershipWithRole } from "@interfaces/approvedMembership.interface";

export class ManagerService implements IManagerService {
  constructor(private readonly managerRepo: IManagerRepository) {}

  async checkIfUserIsManager(userId: string): Promise<ApiResponse<boolean>> {
    return this.managerRepo.existsByUserId(userId);
  }

  async getManagerSocieties(
    userId: string
  ): Promise<ApiResponse<SocietyManagerWithSociety[]>> {
    return this.managerRepo.findByUserId(userId);
  }

  async getManagerAssignment(
    userId: string,
    societyId: string
  ): Promise<ApiResponse<SocietyManager>> {
    return this.managerRepo.findByUserIdAndSociety(userId, societyId);
  }

  async getManagerSocietiesAsResidences(
    userId: string
  ): Promise<ApiResponse<ApprovedMembershipWithRole[]>> {
    return this.managerRepo.findByUserIdAsResidences(userId);
  }
}

const managerService = new ManagerService(managerRepository);

export const checkIfUserIsManager = (userId: string) =>
  managerService.checkIfUserIsManager(userId);
export const getManagerSocieties = (userId: string) =>
  managerService.getManagerSocieties(userId);
export const getManagerAssignment = (userId: string, societyId: string) =>
  managerService.getManagerAssignment(userId, societyId);
export const getManagerSocietiesAsResidences = (userId: string) =>
  managerService.getManagerSocietiesAsResidences(userId);

export { managerService };
