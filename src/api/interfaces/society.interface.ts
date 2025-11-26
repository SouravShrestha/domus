import { Society } from "@models/society";
import { RepositoryResponse } from "./profile.interface";
import { ResidenceWithSociety } from "@/types/api/response/residence";

export interface ISocietyRepository {
    findById(societyId: string): Promise<RepositoryResponse<Society>>;

    fetchSocietyResidences(
        societyId: string
    ): Promise<RepositoryResponse<ResidenceWithSociety[]>>;
}
