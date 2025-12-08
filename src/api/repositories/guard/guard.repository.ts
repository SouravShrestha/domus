import type { SocietyGuard, SocietyGuardWithSociety } from '@/types';
import { supabase_client } from '../../client';
import type { IGuardRepository, SocietyGuardWithDetails } from '@/api/interfaces/guard.interface';
import type { RepositoryResponse } from '@/api/interfaces/profile.interface';

export class SupabaseGuardRepository implements IGuardRepository {
  private readonly tableName = 'society_guards';

  private readonly selectWithDetails = `
    *,
    user:user_profiles!user_id (
      id,
      name,
      phone,
      photo_url
    )
  `;

  async findById(guardId: string): Promise<RepositoryResponse<SocietyGuard>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('id', guardId)
      .single();
  }

  async findBySocietyId(
    societyId: string
  ): Promise<RepositoryResponse<SocietyGuardWithDetails[]>> {
    return supabase_client
      .from(this.tableName)
      .select(this.selectWithDetails)
      .eq('society_id', societyId)
      .order('created_at', { ascending: false });
  }

  async findActiveBySocietyId(
    societyId: string
  ): Promise<RepositoryResponse<SocietyGuardWithDetails[]>> {
    return supabase_client
      .from(this.tableName)
      .select(this.selectWithDetails)
      .eq('society_id', societyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
  }

  async findByUserId(
    userId: string
  ): Promise<RepositoryResponse<SocietyGuardWithSociety[]>> {
    return supabase_client
      .from(this.tableName)
      .select(`
        *,
        society:societies!society_id (
          id,
          name,
          code,
          image_url
        )
      `)
      .eq('user_id', userId);
  }

  async updateStatus(
    guardId: string,
    status: 'active' | 'inactive'
  ): Promise<RepositoryResponse<SocietyGuard>> {
    return supabase_client
      .from(this.tableName)
      .update({ status })
      .eq('id', guardId)
      .select()
      .single();
  }

  async delete(guardId: string): Promise<RepositoryResponse<void>> {
    const { error } = await supabase_client
      .from(this.tableName)
      .delete()
      .eq('id', guardId);

    return { data: null, error };
  }
}

export const guardRepository = new SupabaseGuardRepository();
