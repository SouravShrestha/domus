import { CabInvite, CabInviteStatus, CreateCabInviteParams } from '@/types/models/cab';
import { RepositoryResponse } from '@/api/interfaces/visitor.interface';

export interface ICabInviteRepository {
  create(params: CreateCabInviteParams): Promise<RepositoryResponse<CabInvite>>;
  findByResidenceAndStatus(
    residenceId: string,
    statuses: CabInviteStatus[]
  ): Promise<RepositoryResponse<CabInvite[]>>;
  updateStatus(id: string, status: CabInviteStatus, visitedAt?: string): Promise<RepositoryResponse<CabInvite>>;
  delete(id: string): Promise<RepositoryResponse<null>>;
}

export interface ICabService {
  createCabInvite(params: CreateCabInviteParams): Promise<RepositoryResponse<CabInvite>>;
  getUpcomingCabs(residenceId: string): Promise<RepositoryResponse<CabInvite[]>>;
  getActiveCabs(residenceId: string): Promise<RepositoryResponse<CabInvite[]>>;
  getCabHistory(residenceId: string): Promise<RepositoryResponse<CabInvite[]>>;
  markCabVisited(id: string): Promise<RepositoryResponse<CabInvite>>;
  deleteCabInvite(id: string): Promise<RepositoryResponse<null>>;
}
