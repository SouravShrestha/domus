export type DeliveryInviteStatus = 'scheduled' | 'active' | 'delivered' | 'expired';

export interface DeliveryInvite {
  id: string;
  residence_id: string;
  invited_by_user_id: string;
  delivery_type: string;
  delivery_person_name: string | null;
  order_number: string | null;
  valid_from: string;
  valid_until: string;
  notes: string | null;
  status: DeliveryInviteStatus;
  entered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDeliveryInviteParams {
  residence_id: string;
  invited_by_user_id: string;
  delivery_type: string;
  delivery_person_name?: string;
  order_number?: string;
  valid_from: string;
  valid_until: string;
  notes?: string;
}

export interface UpdateDeliveryInviteParams {
  id: string;
  delivery_type: string;
  delivery_person_name?: string;
  order_number?: string;
  valid_from: string;
  valid_until: string;
  notes?: string;
}
