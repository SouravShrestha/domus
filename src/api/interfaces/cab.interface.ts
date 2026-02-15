import { CabInvite, CabInviteStatus, CreateCabInviteParams, UpdateCabInviteParams } from '@/types/models/cab';
import { ApiResponse } from '@/api/types/apiResponse';

export interface ICabInviteRepository {
  create(params: CreateCabInviteParams): Promise<ApiResponse<CabInvite>>;
  findByResidenceAndStatus(
    residenceId: string,
    statuses: CabInviteStatus[]
  ): Promise<ApiResponse<CabInvite[]>>;
  updateStatus(id: string, status: CabInviteStatus, visitedAt?: string): Promise<ApiResponse<CabInvite>>;
  update(id: string, params: UpdateCabInviteParams): Promise<ApiResponse<CabInvite>>;
  delete(id: string): Promise<ApiResponse<null>>;
}

export interface ICabService {
  createCabInvite(params: CreateCabInviteParams): Promise<ApiResponse<CabInvite>>;
  getUpcomingCabs(residenceId: string): Promise<ApiResponse<CabInvite[]>>;
  getActiveCabs(residenceId: string): Promise<ApiResponse<CabInvite[]>>;
  getCabHistory(residenceId: string): Promise<ApiResponse<CabInvite[]>>;
  markCabVisited(id: string): Promise<ApiResponse<CabInvite>>;
  updateCabInvite(id: string, params: UpdateCabInviteParams): Promise<ApiResponse<CabInvite>>;
  deleteCabInvite(id: string): Promise<ApiResponse<null>>;
}

