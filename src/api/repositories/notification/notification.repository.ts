import { Notification } from "@models/notification";
import { INotificationRepository } from "@interfaces/notification.interface";
import { ApiResponse } from "@/api/types/apiResponse";
import { supabase_client } from "../../client";

export class NotificationRepository implements INotificationRepository {
  async findByUserId(
    userId: string,
    skip: number,
    take: number
  ): Promise<ApiResponse<Notification[]>> {
    const { data, error } = await supabase_client
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(skip, skip + take - 1);

    return { data, error };
  }

  async markAsRead(id: string): Promise<ApiResponse<void>> {
    const { error } = await supabase_client
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    return { data: null, error };
  }

  async markAllAsRead(userId: string): Promise<ApiResponse<void>> {
    const { error } = await supabase_client
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    return { data: null, error };
  }

  async getUnreadCount(userId: string): Promise<ApiResponse<number>> {
    const { count, error } = await supabase_client
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    return { data: count || 0, error };
  }
}

export const notificationRepository = new NotificationRepository();
