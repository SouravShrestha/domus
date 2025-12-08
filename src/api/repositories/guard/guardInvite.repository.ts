import type { SocietyGuardInvite } from '@/types';
import { supabase_client } from '../../client';
import type { IGuardInviteRepository } from '@/api/interfaces/guard.interface';
import type { RepositoryResponse } from '@/api/interfaces/profile.interface';

export class SupabaseGuardInviteRepository implements IGuardInviteRepository {
  private readonly tableName = 'society_guard_invites';

  async create(
    invite: Omit<SocietyGuardInvite, 'id' | 'created_at' | 'status'>
  ): Promise<RepositoryResponse<SocietyGuardInvite>> {
    return supabase_client
      .from(this.tableName)
      .insert({
        society_id: invite.society_id,
        phone: invite.phone,
        name: invite.name || null,
        added_by: invite.added_by || null,
        status: 'pending',
      })
      .select()
      .single();
  }

  async findById(
    inviteId: string
  ): Promise<RepositoryResponse<SocietyGuardInvite>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('id', inviteId)
      .single();
  }

  async findBySocietyId(
    societyId: string
  ): Promise<RepositoryResponse<SocietyGuardInvite[]>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('society_id', societyId)
      .order('created_at', { ascending: false });
  }

  async findPendingBySocietyId(
    societyId: string
  ): Promise<RepositoryResponse<SocietyGuardInvite[]>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('society_id', societyId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
  }

  async findByPhone(
    phone: string
  ): Promise<RepositoryResponse<SocietyGuardInvite>> {
    return supabase_client
      .from(this.tableName)
      .select('*')
      .eq('phone', phone)
      .eq('status', 'pending')
      .single();
  }

  async delete(inviteId: string): Promise<RepositoryResponse<void>> {
    const { error } = await supabase_client
      .from(this.tableName)
      .delete()
      .eq('id', inviteId);

    return { data: null, error };
  }
}

export const guardInviteRepository = new SupabaseGuardInviteRepository();
