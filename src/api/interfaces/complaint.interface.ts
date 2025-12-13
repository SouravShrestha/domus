export type ComplaintLevel = 'resident' | 'society';
export type VoteType = 'upvote' | 'downvote';

export interface Complaint {
  id: string;
  user_id: string;
  society_id: string;
  title: string;
  description?: string;
  category: string;
  status: 'open' | 'closed';
  level: ComplaintLevel;
  created_at: string;
  updated_at: string;
  residence_id?: string;
  raised_by_name?: string;
  upvotes?: number;
  downvotes?: number;
  user_vote?: VoteType | null;
}

export interface ComplaintVote {
  id: string;
  complaint_id: string;
  user_id: string;
  vote_type: VoteType;
  created_at: string;
  updated_at: string;
}

export interface CreateComplaintDto {
  user_id: string;
  title: string;
  description?: string;
  category: string;
  society_id: string;
  level: ComplaintLevel;
  raised_by_name: string;
}
