import { ICabService, ICabInviteRepository } from '@/api/interfaces/cab.interface';
import { RepositoryResponse } from '@/api/interfaces/visitor.interface';
import { CabInvite, CreateCabInviteParams, UpdateCabInviteParams } from '@/types/models/cab';
import { cabInviteRepository } from '@/api/repositories/cab/cabInvite.repository';

export class CabService implements ICabService {
  constructor(private readonly cabInviteRepo: ICabInviteRepository) {}

  async createCabInvite(
    params: CreateCabInviteParams
  ): Promise<RepositoryResponse<CabInvite>> {
    return this.cabInviteRepo.create(params);
  }

  async getUpcomingCabs(
    residenceId: string
  ): Promise<RepositoryResponse<CabInvite[]>> {
    return this.cabInviteRepo.findByResidenceAndStatus(residenceId, ['scheduled']);
  }

  async getActiveCabs(
    residenceId: string
  ): Promise<RepositoryResponse<CabInvite[]>> {
    return this.cabInviteRepo.findByResidenceAndStatus(residenceId, ['active']);
  }

  async getCabHistory(
    residenceId: string
  ): Promise<RepositoryResponse<CabInvite[]>> {
    return this.cabInviteRepo.findByResidenceAndStatus(residenceId, ['visited', 'expired']);
  }

  async markCabVisited(id: string): Promise<RepositoryResponse<CabInvite>> {
    return this.cabInviteRepo.updateStatus(id, 'visited', new Date().toISOString());
  }

  async deleteCabInvite(id: string): Promise<RepositoryResponse<null>> {
    return this.cabInviteRepo.delete(id);
  }

  async updateCabInvite(id: string, params: UpdateCabInviteParams): Promise<RepositoryResponse<CabInvite>> {
    return this.cabInviteRepo.update(id, params);
  }
}

const cabService = new CabService(cabInviteRepository);

export const createCabInvite = (params: CreateCabInviteParams) =>
  cabService.createCabInvite(params);

export const getUpcomingCabs = (residenceId: string) =>
  cabService.getUpcomingCabs(residenceId);

export const getActiveCabs = (residenceId: string) =>
  cabService.getActiveCabs(residenceId);

export const getCabHistory = (residenceId: string) =>
  cabService.getCabHistory(residenceId);

export const markCabVisited = (id: string) =>
  cabService.markCabVisited(id);

export const deleteCabInvite = (id: string) =>
  cabService.deleteCabInvite(id);

export const updateCabInvite = (id: string, params: UpdateCabInviteParams) =>
  cabService.updateCabInvite(id, params);

export { cabService };
