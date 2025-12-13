import { supabase_client } from "@/api/client";
import { Complaint, CreateComplaintDto } from "@/api/interfaces/complaint.interface";

export class ComplaintRepository {
  private readonly tableName = "complaints";

  async create(complaint: CreateComplaintDto & { user_id: string }): Promise<{ data: Complaint | null; error: any }> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .insert(complaint)
      .select()
      .single();

    return { data, error };
  }

  async findBySocietyId(societyId: string): Promise<{ data: Complaint[] | null; error: any }> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select("*")
      .eq("society_id", societyId)
      .order("created_at", { ascending: false });

    return { data, error };
  }

  async findByUserId(userId: string): Promise<{ data: Complaint[] | null; error: any }> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return { data, error };
  }
}

export const complaintRepository = new ComplaintRepository();
