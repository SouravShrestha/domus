import { supabase_client } from '@/api/client';
import {
  IGuestLogRepository,
  RepositoryResponse,
} from '@/api/interfaces/visitor.interface';
import { GuestLog, GuestLogWithInvitation } from '@/types/models/visitor';

class SupabaseGuestLogRepository implements IGuestLogRepository {
  private readonly tableName = 'guest_logs';

  async create(params: {
    guest_invitation_id: string;
    residence_id: string;
    entry_method: string;
    entry_gate?: string;
  }): Promise<RepositoryResponse<GuestLog>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .insert({
        guest_invitation_id: params.guest_invitation_id,
        residence_id: params.residence_id,
        entry_method: params.entry_method,
        entry_gate: params.entry_gate || null,
        entry_time: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  }

  async findById(id: string): Promise<RepositoryResponse<GuestLog>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  }

  async findByInvitationId(invitationId: string): Promise<RepositoryResponse<GuestLog[]>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select('*')
      .eq('guest_invitation_id', invitationId)
      .order('entry_time', { ascending: false });

    return { data, error };
  }

  async findByResidenceId(
    residenceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RepositoryResponse<GuestLogWithInvitation[]>> {
    let query = supabase_client
      .from(this.tableName)
      .select(`
        *,
        guest_invitation:guest_invitations!guest_invitation_id(*)
      `)
      .eq('residence_id', residenceId)
      .order('entry_time', { ascending: false });

    if (startDate) {
      query = query.gte('entry_time', startDate);
    }

    if (endDate) {
      query = query.lte('entry_time', endDate);
    }

    const { data, error } = await query;

    return { data, error };
  }

  async updateExit(
    id: string,
    exitMethod: string,
    exitGate?: string
  ): Promise<RepositoryResponse<GuestLog>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .update({
        exit_time: new Date().toISOString(),
        exit_method: exitMethod,
        exit_gate: exitGate || null,
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async findActiveGuests(residenceId: string): Promise<RepositoryResponse<GuestLogWithInvitation[]>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(`
        *,
        guest_invitation:guest_invitations!guest_invitation_id(*)
      `)
      .eq('residence_id', residenceId)
      .is('exit_time', null)
      .order('entry_time', { ascending: false });

    return { data, error };
  }
}

export const guestLogRepository = new SupabaseGuestLogRepository();
