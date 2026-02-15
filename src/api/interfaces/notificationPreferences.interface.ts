import {
  NotificationPreferences,
  NotificationPreferencesUpdate,
} from "@models/notificationPreferences";
import { ApiResponse } from "@/api/types/apiResponse";

export interface INotificationPreferencesRepository {
  findByUserId(
    userId: string
  ): Promise<ApiResponse<NotificationPreferences>>;

  create(
    userId: string,
    preferences?: NotificationPreferencesUpdate
  ): Promise<ApiResponse<NotificationPreferences>>;

  update(
    userId: string,
    preferences: NotificationPreferencesUpdate
  ): Promise<ApiResponse<NotificationPreferences>>;

  upsert(
    userId: string,
    preferences: NotificationPreferencesUpdate
  ): Promise<ApiResponse<NotificationPreferences>>;
}

export interface INotificationPreferencesService {
  getCurrentUserPreferences(): Promise<NotificationPreferences | null>;

  getPreferencesByUserId(userId: string): Promise<NotificationPreferences | null>;

  updatePreferences(
    userId: string,
    preferences: NotificationPreferencesUpdate
  ): Promise<NotificationPreferences | null>;

  updateSinglePreference(
    userId: string,
    type: "push" | "email" | "sms",
    enabled: boolean
  ): Promise<NotificationPreferences | null>;

  ensurePreferencesExist(userId: string): Promise<NotificationPreferences | null>;
}
