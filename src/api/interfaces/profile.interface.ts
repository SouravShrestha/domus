import { UserProfile } from "@models/user";
import { ApiResponse } from "@/api/types/apiResponse";

export interface IProfileRepository {
  findById(id: string): Promise<ApiResponse<UserProfile>>;
  findByEmail(
    email: string
  ): Promise<ApiResponse<Pick<UserProfile, "id">>>;
  findByPhone(
    phone: string
  ): Promise<ApiResponse<Pick<UserProfile, "id">>>;
  update(
    id: string,
    data: Partial<Omit<UserProfile, 'id' | 'created_at'>>
  ): Promise<ApiResponse<UserProfile>>;
  create(profile: UserProfile): Promise<ApiResponse<UserProfile>>;
  upsert(profile: UserProfile): Promise<ApiResponse<UserProfile>>;
}

export interface IProfileService {
  fetchProfile(id: string): Promise<ApiResponse<UserProfile>>;
  createProfile(user: UserProfile): Promise<ApiResponse<UserProfile>>;
  findByPhone(phone: string): Promise<ApiResponse<Pick<UserProfile, "id">>>;
}
