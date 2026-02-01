import type { SocietyContact } from '@/types';
import { supabase_client } from '../../client';
import type { ISocietyContactRepository } from '@/api/interfaces/societyContact.interface';
import type { RepositoryResponse } from '@/api/interfaces/profile.interface';

export class SupabaseSocietyContactRepository implements ISocietyContactRepository {
  private readonly tableName = 'society_contacts';

  async findById(id: string): Promise<RepositoryResponse<SocietyContact>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
  }

  async findBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyContact[]>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('society_id', societyId)
      .order('type', { ascending: true })
      .order('name', { ascending: true });
  }

  async findActiveBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyContact[]>> {
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
  ): Promise<RepositoryResponse<SocietyContact>> {
    return supabase_client
      .from(this.tableName)
      .insert(contact)
      .select()
      .single();
  }

  async update(
    id: string,
    contact: Partial<Omit<SocietyContact, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<RepositoryResponse<SocietyContact>> {
    return supabase_client
      .from(this.tableName)
      .update({ ...contact, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  }

  async delete(id: string): Promise<RepositoryResponse<void>> {
    const { error } = await supabase_client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    return { data: null, error };
  }
}

export const societyContactRepository = new SupabaseSocietyContactRepository();
