export interface Complaint {
  id: string;
  user_id: string;
  society_id: string;
  title: string;
  description?: string;
  category: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface CreateComplaintDto {
  title: string;
  description?: string;
  category: string;
  society_id: string;
}
