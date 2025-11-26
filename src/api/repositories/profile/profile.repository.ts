import { UserProfile } from "@models/user";
import { supabase_client } from "../../client";
import {
    IProfileRepository,
    RepositoryResponse,
} from "@interfaces/profile.interface";

export class SupabaseProfileRepository implements IProfileRepository {
    private readonly tableName = "user_profiles";

    async findById(id: string): Promise<RepositoryResponse<UserProfile>> {
        return supabase_client
            .from(this.tableName)
            .select("*")
            .eq("id", id)
            .single();
    }

    async findByEmail(
        email: string
    ): Promise<RepositoryResponse<Pick<UserProfile, "id">>> {
        return supabase_client
            .from(this.tableName)
            .select("id")
            .eq("email", email)
            .maybeSingle();
    }

    async findByPhone(
        phone: string
    ): Promise<RepositoryResponse<Pick<UserProfile, "id">>> {
        return supabase_client
            .from(this.tableName)
            .select("id")
            .eq("phone", phone)
            .maybeSingle();
    }

    async create(profile: UserProfile): Promise<RepositoryResponse<UserProfile>> {
        return supabase_client.from(this.tableName).insert(profile).select().single();
    }

    async upsert(profile: UserProfile): Promise<RepositoryResponse<UserProfile>> {
        return supabase_client.from(this.tableName).upsert(profile).select().single();
    }
}

export const profileRepository = new SupabaseProfileRepository();
