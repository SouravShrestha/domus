import { UserProfile } from "@models/user";
import type { PostgrestError } from "@supabase/supabase-js";

export interface RepositoryResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface IProfileRepository {
  findById(id: string): Promise<RepositoryResponse<UserProfile>>;
  findByEmail(
    email: string
  ): Promise<RepositoryResponse<Pick<UserProfile, "id">>>;
  findByPhone(
    phone: string
  ): Promise<RepositoryResponse<Pick<UserProfile, "id">>>;
  create(profile: UserProfile): Promise<RepositoryResponse<UserProfile>>;
  upsert(profile: UserProfile): Promise<RepositoryResponse<UserProfile>>;
}

export interface IProfileService {
  fetchProfile(id: string): Promise<RepositoryResponse<UserProfile>>;
  createProfile(user: UserProfile): Promise<RepositoryResponse<UserProfile>>;
  findByPhone(phone: string): Promise<RepositoryResponse<Pick<UserProfile, "id">>>;
}
