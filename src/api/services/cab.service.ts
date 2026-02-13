import { ICabService, ICabInviteRepository } from '@/api/interfaces/cab.interface';
import { RepositoryResponse } from '@/api/interfaces/visitor.interface';
import { CabInvite, CreateCabInviteParams } from '@/types/models/cab';
import { cabInviteRepository } from '@/api/repositories/cab/cabInvite.repository';

export class CabService implements ICabService {
  constructor(private readonly cabInviteRepo: ICabInviteRepository) {}

  async createCabInvite(
    params: CreateCabInviteParams
  ): Promise<RepositoryResponse<CabInvite>> {
    return this.cabInviteRepo.create(params);
  }
}

const cabService = new CabService(cabInviteRepository);

export const createCabInvite = (params: CreateCabInviteParams) =>
  cabService.createCabInvite(params);

export { cabService };
