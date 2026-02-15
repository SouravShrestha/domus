import {
  NotificationPreferences,
  NotificationPreferencesUpdate,
} from "@models/notificationPreferences";
import { supabase_client } from "../../client";
import { INotificationPreferencesRepository } from "@interfaces/notificationPreferences.interface";
import { ApiResponse } from "@/api/types/apiResponse";

export class SupabaseNotificationPreferencesRepository
  implements INotificationPreferencesRepository
{
  private readonly tableName = "user_notification_preferences";

  async findByUserId(
    userId: string
  ): Promise<ApiResponse<NotificationPreferences>> {
    return supabase_client
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .single();
  }

  async create(
    userId: string,
    preferences?: NotificationPreferencesUpdate
  ): Promise<ApiResponse<NotificationPreferences>> {
    const data = {
      user_id: userId,
      enable_push_notifications: preferences?.enable_push_notifications ?? true,
      enable_email_notifications: preferences?.enable_email_notifications ?? true,
      enable_sms_notifications: preferences?.enable_sms_notifications ?? true,
    };

    return supabase_client.from(this.tableName).insert(data).select().single();
  }

  async update(
    userId: string,
    preferences: NotificationPreferencesUpdate
  ): Promise<ApiResponse<NotificationPreferences>> {
    const filteredUpdates = Object.fromEntries(
      Object.entries(preferences).filter(([_, value]) => value !== undefined)
    );

    return supabase_client
      .from(this.tableName)
      .update(filteredUpdates)
      .eq("user_id", userId)
      .select()
      .single();
  }

  async upsert(
    userId: string,
    preferences: NotificationPreferencesUpdate
  ): Promise<ApiResponse<NotificationPreferences>> {
    const data = {
      user_id: userId,
      enable_push_notifications: preferences.enable_push_notifications ?? true,
      enable_email_notifications: preferences.enable_email_notifications ?? true,
      enable_sms_notifications: preferences.enable_sms_notifications ?? true,
    };

    return supabase_client
      .from(this.tableName)
      .upsert(data, { onConflict: "user_id" })
      .select()
      .single();
  }
}

export const notificationPreferencesRepository =
  new SupabaseNotificationPreferencesRepository();
