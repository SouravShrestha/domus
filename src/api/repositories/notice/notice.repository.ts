import { supabase_client } from "@/api/client";
import { Notice } from "@/api/interfaces/notice.interface";
import { CreateNoticeInput } from "@/types/models/notice";

export class NoticeRepository {
  private readonly tableName = "notices";

  async findBySocietyId(societyId: string): Promise<{ data: Notice[] | null; error: any }> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(`
        *,
        user_profiles!notices_created_by_fkey(name)
      `)
      .eq("society_id", societyId)
      .order("created_at", { ascending: false });

    const notices = data?.map((notice: any) => ({
      ...notice,
      created_by_name: notice.user_profiles?.name || null,
      user_profiles: undefined,
    }));

    return { data: notices, error };
  }

  async createNotice(
    societyId: string,
    userId: string,
    input: CreateNoticeInput
  ): Promise<{ data: Notice | null; error: any }> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .insert({
        society_id: societyId,
        created_by: userId,
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        audience: input.audience,
        status: "published",
      })
      .select()
      .single();

    return { data, error };
  }

  async updateNotice(
    noticeId: string,
    input: Partial<CreateNoticeInput>
  ): Promise<{ data: Notice | null; error: any }> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .update({
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        audience: input.audience,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noticeId)
      .select()
      .single();

    return { data, error };
  }

  async deleteNotice(noticeId: string): Promise<{ error: any }> {
    const { error } = await supabase_client
      .from(this.tableName)
      .delete()
      .eq("id", noticeId);

    return { error };
  }
}

export const noticeRepository = new NoticeRepository();
