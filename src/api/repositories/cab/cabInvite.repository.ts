import { supabase_client } from '@/api/client';
import { ICabInviteRepository } from '@/api/interfaces/cab.interface';
import { RepositoryResponse } from '@/api/interfaces/visitor.interface';
import { CabInvite, CreateCabInviteParams } from '@/types/models/cab';

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
}

export const cabInviteRepository = new SupabaseCabInviteRepository();
