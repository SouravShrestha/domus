import { supabase_client } from '@/api/client';
import { ICabInviteRepository } from '@/api/interfaces/cab.interface';
import { RepositoryResponse } from '@/api/interfaces/visitor.interface';
import { CabInvite, CabInviteStatus, CreateCabInviteParams, UpdateCabInviteParams } from '@/types/models/cab';

class SupabaseCabInviteRepository implements ICabInviteRepository {
  private readonly tableName = 'cab_invites';

  async create(params: CreateCabInviteParams): Promise<RepositoryResponse<CabInvite>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .insert({
        residence_id: params.residence_id,
        invited_by_user_id: params.invited_by_user_id,
        cab_type: params.cab_type,
        driver_name: params.driver_name || null,
        vehicle_number: params.vehicle_number || null,
        valid_from: params.valid_from,
        valid_until: params.valid_until,
        notes: params.notes || null,
        status: 'scheduled',
      })
      .select()
      .single();

    return { data, error };
  }

  async findByResidenceAndStatus(
    residenceId: string,
    statuses: CabInviteStatus[]
  ): Promise<RepositoryResponse<CabInvite[]>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select('*')
      .eq('residence_id', residenceId)
      .in('status', statuses)
      .order('valid_from', { ascending: false });

    return { data, error };
  }

  async updateStatus(
    id: string,
    status: CabInviteStatus,
    visitedAt?: string
  ): Promise<RepositoryResponse<CabInvite>> {
    const updateData: Record<string, string> = { status };
    if (visitedAt) updateData.visited_at = visitedAt;

    const { data, error } = await supabase_client
      .from(this.tableName)
      .update(updateData)
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

  async update(id: string, params: UpdateCabInviteParams): Promise<RepositoryResponse<CabInvite>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .update({
        cab_type: params.cab_type,
        driver_name: params.driver_name || null,
        vehicle_number: params.vehicle_number || null,
        valid_from: params.valid_from,
        valid_until: params.valid_until,
        notes: params.notes || null,
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
}

export const cabInviteRepository = new SupabaseCabInviteRepository();
