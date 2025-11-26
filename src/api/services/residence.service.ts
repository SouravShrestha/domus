import { ResidenceWithSociety } from "@/types/api/response/residence";
import { PendingResidenceMembership } from "@models/residenceMembership";
import { residenceRepository } from "@repositories/residence/residence.repository";
import { pendingMembershipRepository } from "@repositories/membership/pendingMembership.repository";
import {
  IResidenceRepository,
  IResidenceService,
} from "@interfaces/residence.interface";
import { RepositoryResponse } from "@interfaces/profile.interface";
import { IPendingMembershipRepository } from "@interfaces/pendingMembership.interface";

const DEFAULT_ROLE = "resident";
const DEFAULT_STATUS = "pending";

export class ResidenceService implements IResidenceService {
  constructor(
    private readonly residenceRepo: IResidenceRepository,
    private readonly pendingMembershipRepo: IPendingMembershipRepository
  ) {}

  async fetchResidenceWithSociety(
    residenceId: string
  ): Promise<RepositoryResponse<ResidenceWithSociety>> {
    return this.residenceRepo.findByIdWithSociety(residenceId);
  }

  async requestResidenceMembership(
    residenceId: string,
    userId: string,
    role: string = DEFAULT_ROLE
  ): Promise<RepositoryResponse<PendingResidenceMembership>> {
    return this.pendingMembershipRepo.create({
      user_id: userId,
      residence_id: residenceId,
      role,
      status: DEFAULT_STATUS,
      invitation_id: null,
    });
  }
}

const residenceService = new ResidenceService(
  residenceRepository,
  pendingMembershipRepository
);

export const fetchResidenceWithSociety = (residenceId: string) =>
  residenceService.fetchResidenceWithSociety(residenceId);

export const requestResidenceMembership = (
  residenceId: string,
  userId: string,
  role?: string
) => residenceService.requestResidenceMembership(residenceId, userId, role);

export { residenceService };
