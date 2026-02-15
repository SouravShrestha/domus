import type { SocietyContact } from '@/types';
import type { ISocietyContactRepository } from '@/api/interfaces/societyContact.interface';
import { BaseRepository } from '@/api/repositories/base/baseRepository';
import type { ApiResponse } from '@/api/types/apiResponse';
import { supabase_client } from '@/api/client';

export class SupabaseSocietyContactRepository
  extends BaseRepository<SocietyContact>
  implements ISocietyContactRepository
{
  constructor() {
    super('society_contacts');
  }

  async findBySocietyId(societyId: string): Promise<ApiResponse<SocietyContact[]>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('society_id', societyId)
      .order('type', { ascending: true })
      .order('name', { ascending: true });
  }

  async findActiveBySocietyId(societyId: string): Promise<ApiResponse<SocietyContact[]>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('society_id', societyId)
      .eq('is_active', true)
      .order('type', { ascending: true })
      .order('name', { ascending: true });
  }
  async create(
    contact: Omit<SocietyContact, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ApiResponse<SocietyContact>> {
    return supabase_client
      .from(this.tableName)
      .insert(contact)
      .select()
      .single();
  }

  async update(
    id: string,
    contact: Partial<Omit<SocietyContact, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<ApiResponse<SocietyContact>> {
    return supabase_client
      .from(this.tableName)
      .update({ ...contact, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  }
}

export const societyContactRepository = new SupabaseSocietyContactRepository();
