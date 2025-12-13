import { supabase_client } from "@/api/client";
import { Complaint, CreateComplaintDto, ComplaintVote, VoteType } from "@/api/interfaces/complaint.interface";

export class ComplaintRepository {
  private readonly tableName = "complaints";
  private readonly votesTableName = "complaint_votes";

  async create(complaint: CreateComplaintDto): Promise<{ data: Complaint | null; error: any }> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .insert(complaint)
      .select()
      .single();

    return { data, error };
  }

  async findBySocietyId(societyId: string, userId?: string): Promise<{ data: Complaint[] | null; error: any }> {
    const { data: complaints, error } = await supabase_client
      .from(this.tableName)
      .select("*")
      .eq("society_id", societyId)
      .order("created_at", { ascending: false });

    if (error || !complaints) return { data: complaints, error };

    const complaintsWithVotes = await this.attachVoteCounts(complaints, userId);
    return { data: complaintsWithVotes, error: null };
  }

  async findByUserId(userId: string): Promise<{ data: Complaint[] | null; error: any }> {
    const { data: complaints, error } = await supabase_client
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !complaints) return { data: complaints, error };

    const complaintsWithVotes = await this.attachVoteCounts(complaints, userId);
    return { data: complaintsWithVotes, error: null };
  }

  async findByResidenceAndSociety(userId: string, societyId: string): Promise<{ data: Complaint[] | null; error: any }> {
    const { data: complaints, error } = await supabase_client
      .from(this.tableName)
      .select("*")
      .eq("society_id", societyId)
      .or(`user_id.eq.${userId},level.eq.society`)
      .order("created_at", { ascending: false });

    if (error || !complaints) return { data: complaints, error };

    const complaintsWithVotes = await this.attachVoteCounts(complaints, userId);
    return { data: complaintsWithVotes, error: null };
  }

  async vote(complaintId: string, userId: string, voteType: VoteType): Promise<{ data: ComplaintVote | null; error: any }> {
    const { data, error } = await supabase_client
      .from(this.votesTableName)
      .upsert(
        { complaint_id: complaintId, user_id: userId, vote_type: voteType, updated_at: new Date().toISOString() },
        { onConflict: 'complaint_id,user_id' }
      )
      .select()
      .single();

    return { data, error };
  }

  async removeVote(complaintId: string, userId: string): Promise<{ error: any }> {
    const { error } = await supabase_client
      .from(this.votesTableName)
      .delete()
      .eq("complaint_id", complaintId)
      .eq("user_id", userId);

    return { error };
  }

  async getVoteCounts(complaintId: string): Promise<{ upvotes: number; downvotes: number }> {
    const { data } = await supabase_client
      .from(this.votesTableName)
      .select("vote_type")
      .eq("complaint_id", complaintId);

    const upvotes = data?.filter((v) => v.vote_type === "upvote").length || 0;
    const downvotes = data?.filter((v) => v.vote_type === "downvote").length || 0;

    return { upvotes, downvotes };
  }

  async getUserVote(complaintId: string, userId: string): Promise<VoteType | null> {
    const { data } = await supabase_client
      .from(this.votesTableName)
      .select("vote_type")
      .eq("complaint_id", complaintId)
      .eq("user_id", userId)
      .single();

    return data?.vote_type || null;
  }

  private async attachVoteCounts(complaints: Complaint[], userId?: string): Promise<Complaint[]> {
    const complaintIds = complaints.map((c) => c.id);

    const { data: votes } = await supabase_client
      .from(this.votesTableName)
      .select("complaint_id, user_id, vote_type")
      .in("complaint_id", complaintIds);

    return complaints.map((complaint) => {
      const complaintVotes = votes?.filter((v) => v.complaint_id === complaint.id) || [];
      const upvotes = complaintVotes.filter((v) => v.vote_type === "upvote").length;
      const downvotes = complaintVotes.filter((v) => v.vote_type === "downvote").length;
      const userVote = userId
        ? complaintVotes.find((v) => v.user_id === userId)?.vote_type || null
        : null;

      return {
        ...complaint,
        upvotes,
        downvotes,
        user_vote: userVote,
      };
    });
  }
}

export const complaintRepository = new ComplaintRepository();
