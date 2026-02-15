import { Society } from "@models/society";
import { ApiResponse } from "@/api/types/apiResponse";
import { ResidenceWithSociety } from "@/types/api/response/residence";

export interface ISocietyRepository {
    findById(societyId: string): Promise<ApiResponse<Society>>;

    fetchSocietyResidences(
        societyId: string
    ): Promise<ApiResponse<ResidenceWithSociety[]>>;
}
