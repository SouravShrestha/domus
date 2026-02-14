import { supabase_client } from '@/api/client';
import {
  IGuestInvitationRepository,
  RepositoryResponse,
} from '@/api/interfaces/visitor.interface';
import {
  GuestInvitation,
  GuestInvitationWithDetails,
  GuestInvitationStatus,
  CreateGuestInvitationParams,
  UpdateGuestInvitationParams,
} from '@/types/models/visitor';

class SupabaseGuestInvitationRepository implements IGuestInvitationRepository {
  private readonly tableName = 'guest_invitations';

  async create(
    params: CreateGuestInvitationParams & { pass_code: string }
  ): Promise<RepositoryResponse<GuestInvitation>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .insert({
        residence_id: params.residence_id,
        invited_by_user_id: params.invited_by_user_id,
        visitor_name: params.visitor_name,
        visitor_phone: params.visitor_phone,
        purpose: params.purpose || null,
        pass_code: params.pass_code,
        valid_from: params.valid_from,
        valid_until: params.valid_until,
        visits_allowed: params.visits_allowed || 1,
        vehicle_number: params.vehicle_number || null,
        notes: params.notes || null,
      })
      .select()
      .single();

    return { data, error };
  }

  async findById(id: string): Promise<RepositoryResponse<GuestInvitation>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  }

  async findByIdWithDetails(id: string): Promise<RepositoryResponse<GuestInvitationWithDetails>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(`
        *,
        invited_by:user_profiles!invited_by_user_id(id, name, phone, photo_url),
        residence:residences!residence_id(
          id, short_name, flat_number, block,
          society:societies(id, name, address)
        )
      `)
      .eq('id', id)
      .single();

    return { data, error };
  }

  async findByPassCode(passCode: string): Promise<RepositoryResponse<GuestInvitationWithDetails>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(`
        *,
        invited_by:user_profiles!invited_by_user_id(id, name, phone, photo_url),
        residence:residences!residence_id(
          id, short_name, flat_number, block,
          society:societies(id, name, address)
        )
      `)
      .eq('pass_code', passCode)
      .single();

    return { data, error };
  }

  async findByResidenceId(
    residenceId: string,
    status?: GuestInvitationStatus | null
  ): Promise<RepositoryResponse<GuestInvitationWithDetails[]>> {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    let query = supabase_client
      .from(this.tableName)
      .select(`
        *,
        invited_by:user_profiles!invited_by_user_id(id, name, phone, photo_url),
        residence:residences!residence_id(
          id, short_name, flat_number, block,
          society:societies(id, name, address)
        )
      `)
      .eq('residence_id', residenceId)
      .gte('valid_until', fiveDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    return { data, error };
  }

  async findByInvitedByUserId(
    userId: string,
    status?: GuestInvitationStatus | null
  ): Promise<RepositoryResponse<GuestInvitationWithDetails[]>> {
    let query = supabase_client
      .from(this.tableName)
      .select(`
        *,
        invited_by:user_profiles!invited_by_user_id(id, name, phone, photo_url),
        residence:residences!residence_id(
          id, short_name, flat_number, block,
          society:societies(id, name, address)
        )
      `)
      .eq('invited_by_user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    return { data, error };
  }

  async findActiveByResidenceId(
    residenceId: string
  ): Promise<RepositoryResponse<GuestInvitationWithDetails[]>> {
    const now = new Date().toISOString();

    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(`
        *,
        invited_by:user_profiles!invited_by_user_id(id, name, phone, photo_url),
        residence:residences!residence_id(
          id, short_name, flat_number, block,
          society:societies(id, name, address)
        )
      `)
      .eq('residence_id', residenceId)
      .eq('status', 'active')
      .gte('valid_until', now)
      .order('valid_from', { ascending: true });

    return { data, error };
  }

  async updateStatus(
    id: string,
    status: GuestInvitationStatus
  ): Promise<RepositoryResponse<GuestInvitation>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async incrementVisitsUsed(id: string): Promise<RepositoryResponse<GuestInvitation>> {
    const { data: current, error: fetchError } = await this.findById(id);
    
    if (fetchError || !current) {
      return { data: null, error: fetchError };
    }

    const newVisitsUsed = current.visits_used + 1;
    const newStatus: GuestInvitationStatus = 
      newVisitsUsed >= current.visits_allowed ? 'used' : 'active';

    const { data, error } = await supabase_client
      .from(this.tableName)
      .update({ 
        visits_used: newVisitsUsed, 
        status: newStatus,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async delete(id: string): Promise<RepositoryResponse<null>> {
    const { error } = await supabase_client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    return { data: null, error };
  }

  async isPassCodeUnique(passCode: string): Promise<boolean> {
    const { data } = await supabase_client
      .from(this.tableName)
      .select('id')
      .eq('pass_code', passCode)
      .maybeSingle();

    return !data;
  }

  async update(id: string, params: UpdateGuestInvitationParams): Promise<RepositoryResponse<GuestInvitation>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .update({
        visitor_name: params.visitor_name,
        purpose: params.purpose || null,
        valid_from: params.valid_from,
        valid_until: params.valid_until,
        visits_allowed: params.visits_allowed || 1,
        vehicle_number: params.vehicle_number || null,
        notes: params.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
}

export const guestInvitationRepository = new SupabaseGuestInvitationRepository();
