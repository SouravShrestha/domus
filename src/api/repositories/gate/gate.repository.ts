import type { SocietyGate } from '@/types/models/societyGate';
import type { IGateRepository } from '@/api/interfaces/gate.interface';
import { BaseRepository } from '@/api/repositories/base/baseRepository';
import type { ApiResponse } from '@/api/types/apiResponse';
import { supabase_client } from '@/api/client';

export class SupabaseGateRepository
  extends BaseRepository<SocietyGate>
  implements IGateRepository
{
  constructor() {
    super('society_gates');
  }

  async findBySocietyId(
    societyId: string
  ): Promise<ApiResponse<SocietyGate[]>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('society_id', societyId)
      .order('name', { ascending: true });
  }

  async findActiveBySocietyId(
    societyId: string
  ): Promise<ApiResponse<SocietyGate[]>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('society_id', societyId)
      .eq('is_active', true)
      .order('name', { ascending: true });
  }
}

export const gateRepository = new SupabaseGateRepository();
