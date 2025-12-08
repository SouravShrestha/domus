import type { SocietyGate } from '@/types';
import { supabase_client } from '../../client';
import type { IGateRepository } from '@/api/interfaces/gate.interface';
import type { RepositoryResponse } from '@/api/interfaces/profile.interface';

export class SupabaseGateRepository implements IGateRepository {
  private readonly tableName = 'society_gates';

  async findById(gateId: string): Promise<RepositoryResponse<SocietyGate>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('id', gateId)
      .single();
  }

  async findBySocietyId(
    societyId: string
  ): Promise<RepositoryResponse<SocietyGate[]>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('society_id', societyId)
      .order('name', { ascending: true });
  }

  async findActiveBySocietyId(
    societyId: string
  ): Promise<RepositoryResponse<SocietyGate[]>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('society_id', societyId)
      .eq('is_active', true)
      .order('name', { ascending: true });
  }

  async create(
    gate: Omit<SocietyGate, 'id' | 'created_at'>
  ): Promise<RepositoryResponse<SocietyGate>> {
    return supabase_client
      .from(this.tableName)
      .insert(gate)
      .select()
      .single();
  }

  async update(
    gateId: string,
    gate: Partial<Omit<SocietyGate, 'id' | 'created_at'>>
  ): Promise<RepositoryResponse<SocietyGate>> {
    return supabase_client
      .from(this.tableName)
      .update(gate)
      .eq('id', gateId)
      .select()
      .single();
  }

  async delete(gateId: string): Promise<RepositoryResponse<void>> {
    const { error } = await supabase_client
      .from(this.tableName)
      .delete()
      .eq('id', gateId);

    return { data: null, error };
  }
}

export const gateRepository = new SupabaseGateRepository();
