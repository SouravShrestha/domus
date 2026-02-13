import { CabInvite, CreateCabInviteParams } from '@/types/models/cab';
import { RepositoryResponse } from '@/api/interfaces/visitor.interface';

export interface ICabInviteRepository {
  create(params: CreateCabInviteParams): Promise<RepositoryResponse<CabInvite>>;
}

export interface ICabService {
  createCabInvite(params: CreateCabInviteParams): Promise<RepositoryResponse<CabInvite>>;
}
