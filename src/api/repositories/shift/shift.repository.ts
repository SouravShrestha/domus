import type { SocietyShift } from '@/types';
import type { IShiftRepository } from '@/api/interfaces/shift.interface';
import { BaseRepository } from '@/api/repositories/base/baseRepository';
import type { ApiResponse } from '@/api/types/apiResponse';
import { supabase_client } from '@/api/client';

export class SupabaseShiftRepository
  extends BaseRepository<SocietyShift>
  implements IShiftRepository
{
  constructor() {
    super('society_shifts');
  }

  async findBySocietyId(
    societyId: string
  ): Promise<ApiResponse<SocietyShift[]>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('society_id', societyId)
      .order('start_time', { ascending: true });
  }

  async findActiveBySocietyId(
    societyId: string
  ): Promise<ApiResponse<SocietyShift[]>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('society_id', societyId)
      .eq('is_active', true)
      .order('start_time', { ascending: true });
  }
}

export const shiftRepository = new SupabaseShiftRepository();
