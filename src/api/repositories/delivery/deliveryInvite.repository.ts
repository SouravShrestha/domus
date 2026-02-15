import { supabase_client } from '@/api/client';
import { IDeliveryInviteRepository } from '@/api/interfaces/delivery.interface';
import { ApiResponse } from '@/api/types/apiResponse';
import { DeliveryInvite, DeliveryInviteStatus, CreateDeliveryInviteParams, UpdateDeliveryInviteParams } from '@/types/models/delivery';

class SupabaseDeliveryInviteRepository implements IDeliveryInviteRepository {
  private readonly tableName = 'delivery_invites';

  async create(params: CreateDeliveryInviteParams): Promise<ApiResponse<DeliveryInvite>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .insert({
        residence_id: params.residence_id,
        invited_by_user_id: params.invited_by_user_id,
        delivery_type: params.delivery_type,
        delivery_person_name: params.delivery_person_name || null,
        order_number: params.order_number || null,
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
    statuses: DeliveryInviteStatus[]
  ): Promise<ApiResponse<DeliveryInvite[]>> {
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
    status: DeliveryInviteStatus,
    enteredAt?: string
  ): Promise<ApiResponse<DeliveryInvite>> {
    const updateData: Record<string, string> = { status };
    if (enteredAt) updateData.entered_at = enteredAt;

    const { data, error } = await supabase_client
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const { error } = await supabase_client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    return { data: null, error };
  }

  async update(id: string, params: UpdateDeliveryInviteParams): Promise<ApiResponse<DeliveryInvite>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .update({
        delivery_type: params.delivery_type,
        delivery_person_name: params.delivery_person_name || null,
        order_number: params.order_number || null,
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

export const deliveryInviteRepository = new SupabaseDeliveryInviteRepository();
