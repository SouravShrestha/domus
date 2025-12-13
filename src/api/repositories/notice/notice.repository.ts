import { supabase_client } from "@/api/client";
import { Notice } from "@/api/interfaces/notice.interface";

export class NoticeRepository {
  private readonly tableName = "notices";

  async findBySocietyId(societyId: string): Promise<{ data: Notice[] | null; error: any }> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select("*")
      .eq("society_id", societyId)
      .order("created_at", { ascending: false });

    return { data, error };
  }
}

export const noticeRepository = new NoticeRepository();
