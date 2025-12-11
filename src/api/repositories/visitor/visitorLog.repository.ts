import { supabase_client } from '@/api/client';
import {
  IGuestLogRepository,
  RepositoryResponse,
} from '@/api/interfaces/visitor.interface';
import { GuestLog, GuestLogWithInvitation, UnifiedGuestHistoryEntry } from '@/types/models/visitor';

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

  async findUnifiedHistory(
    residenceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RepositoryResponse<UnifiedGuestHistoryEntry[]>> {
    let guestLogsQuery = supabase_client
      .from(this.tableName)
      .select(`
        *,
        guest_invitation:guest_invitations!guest_invitation_id(*)
      `)
      .eq('residence_id', residenceId)
      .order('entry_time', { ascending: false });

    let walkInLogsQuery = supabase_client
      .from('walk_in_visitor_logs')
      .select('*')
      .eq('residence_id', residenceId)
      .in('approval_status', ['approved', 'not_required'])
      .order('entry_time', { ascending: false });

    if (startDate) {
      guestLogsQuery = guestLogsQuery.gte('entry_time', startDate);
      walkInLogsQuery = walkInLogsQuery.gte('entry_time', startDate);
    }

    if (endDate) {
      guestLogsQuery = guestLogsQuery.lte('entry_time', endDate);
      walkInLogsQuery = walkInLogsQuery.lte('entry_time', endDate);
    }

    const [guestLogsResult, walkInLogsResult] = await Promise.all([
      guestLogsQuery,
      walkInLogsQuery,
    ]);

    if (guestLogsResult.error) {
      return { data: null, error: guestLogsResult.error };
    }

    if (walkInLogsResult.error) {
      return { data: null, error: walkInLogsResult.error };
    }

    const unifiedEntries: UnifiedGuestHistoryEntry[] = [];

    for (const log of guestLogsResult.data || []) {
      const invitation = log.guest_invitation;
      unifiedEntries.push({
        id: log.id,
        type: 'invited',
        residence_id: log.residence_id,
        visitor_name: invitation?.visitor_name || 'Unknown',
        visitor_phone: invitation?.visitor_phone || null,
        purpose: invitation?.purpose || null,
        pass_code: invitation?.pass_code || null,
        entry_time: log.entry_time,
        exit_time: log.exit_time,
        entry_method: log.entry_method,
        exit_method: log.exit_method,
        entry_gate: log.entry_gate,
        exit_gate: log.exit_gate,
        vehicle_number: invitation?.vehicle_number || null,
        guard_notes: log.guard_notes,
        created_at: log.created_at,
      });
    }

    for (const log of walkInLogsResult.data || []) {
      unifiedEntries.push({
        id: log.id,
        type: 'walk_in',
        residence_id: log.residence_id,
        visitor_name: log.visitor_name,
        visitor_phone: log.visitor_phone,
        purpose: log.purpose,
        pass_code: log.temp_pass_code,
        entry_time: log.entry_time,
        exit_time: log.exit_time,
        entry_method: log.entry_method,
        exit_method: log.exit_method,
        entry_gate: log.entry_gate,
        exit_gate: log.exit_gate,
        vehicle_number: log.vehicle_number,
        guard_notes: log.guard_notes,
        created_at: log.created_at,
      });
    }

    unifiedEntries.sort((a, b) => 
      new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime()
    );

    return { data: unifiedEntries, error: null };
  }
}

export const guestLogRepository = new SupabaseGuestLogRepository();
