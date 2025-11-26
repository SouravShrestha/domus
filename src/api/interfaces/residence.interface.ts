import {
  PendingResidenceMembership,
} from "@models/residenceMembership";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import { RepositoryResponse } from "./profile.interface";

export interface IResidenceRepository {
  findByIdWithSociety(
    residenceId: string
  ): Promise<RepositoryResponse<ResidenceWithSociety>>;
}

export interface IResidenceService {
  fetchResidenceWithSociety(
    residenceId: string
  ): Promise<RepositoryResponse<ResidenceWithSociety>>;

  requestResidenceMembership(
    residenceId: string,
    userId: string,
    role?: string
  ): Promise<RepositoryResponse<PendingResidenceMembership>>;
}
