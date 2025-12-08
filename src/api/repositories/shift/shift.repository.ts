import type { SocietyShift } from '@/types';
import { supabase_client } from '../../client';
import type { IShiftRepository } from '@/api/interfaces/shift.interface';
import type { RepositoryResponse } from '@/api/interfaces/profile.interface';

export class SupabaseShiftRepository implements IShiftRepository {
  private readonly tableName = 'society_shifts';

  async findById(shiftId: string): Promise<RepositoryResponse<SocietyShift>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('id', shiftId)
      .single();
  }

  async findBySocietyId(
    societyId: string
  ): Promise<RepositoryResponse<SocietyShift[]>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('society_id', societyId)
      .order('start_time', { ascending: true });
  }

  async findActiveBySocietyId(
    societyId: string
  ): Promise<RepositoryResponse<SocietyShift[]>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('society_id', societyId)
      .eq('is_active', true)
      .order('start_time', { ascending: true });
  }

  async create(
    shift: Omit<SocietyShift, 'id' | 'created_at'>
  ): Promise<RepositoryResponse<SocietyShift>> {
    return supabase_client
      .from(this.tableName)
      .insert(shift)
      .select()
      .single();
  }

  async update(
    shiftId: string,
    shift: Partial<Omit<SocietyShift, 'id' | 'created_at'>>
  ): Promise<RepositoryResponse<SocietyShift>> {
    return supabase_client
      .from(this.tableName)
      .update(shift)
      .eq('id', shiftId)
      .select()
      .single();
  }

  async delete(shiftId: string): Promise<RepositoryResponse<void>> {
    const { error } = await supabase_client
      .from(this.tableName)
      .delete()
      .eq('id', shiftId);

    return { data: null, error };
  }
}

export const shiftRepository = new SupabaseShiftRepository();
