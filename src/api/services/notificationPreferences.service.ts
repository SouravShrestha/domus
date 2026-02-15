import {
  NotificationPreferences,
  NotificationPreferencesUpdate,
} from "@models/notificationPreferences";
import type { PostgrestError } from "@supabase/supabase-js";
import {
  INotificationPreferencesRepository,
  INotificationPreferencesService,
} from "@interfaces/notificationPreferences.interface";
import { notificationPreferencesRepository } from "@repositories/notification/notificationPreferences.repository";
import { getCurrentUserId } from '@/api/utils/getCurrentUser';
import { apiLogger } from '@/api/utils/logger';

export class NotificationPreferencesService
  implements INotificationPreferencesService
{
  constructor(
    private readonly notificationPreferencesRepo: INotificationPreferencesRepository
  ) {}

  async getCurrentUserPreferences(): Promise<NotificationPreferences | null> {
    const userId = await getCurrentUserId();

    if (!userId) {
      return null;
    }

    return this.getPreferencesByUserId(userId);
  }

  async getPreferencesByUserId(
    userId: string
  ): Promise<NotificationPreferences | null> {
    const { data, error } =
      await this.notificationPreferencesRepo.findByUserId(userId);

    if (error) {
      if ('code' in error && (error as PostgrestError).code === "PGRST116") {
        return this.ensurePreferencesExist(userId);
      }
      apiLogger.error("NotificationPreferencesService", "Failed to fetch preferences", error);
      return null;
    }

    return data;
  }

  async updatePreferences(
    userId: string,
    preferences: NotificationPreferencesUpdate
  ): Promise<NotificationPreferences | null> {
    const { data, error } = await this.notificationPreferencesRepo.update(
      userId,
      preferences
    );

    if (error) {
      if ('code' in error && (error as PostgrestError).code === "PGRST116") {
        const { data: createdData, error: createError } =
          await this.notificationPreferencesRepo.create(userId, preferences);

        if (createError) {
          apiLogger.error("NotificationPreferencesService", "Failed to create preferences", createError);
          return null;
        }

        return createdData;
      }

      apiLogger.error("NotificationPreferencesService", "Failed to update preferences", error);
      return null;
    }

    return data;
  }

  async updateSinglePreference(
    userId: string,
    type: "push" | "email" | "sms",
    enabled: boolean
  ): Promise<NotificationPreferences | null> {
    const preferenceMap: Record<string, keyof NotificationPreferencesUpdate> = {
      push: "enable_push_notifications",
      email: "enable_email_notifications",
      sms: "enable_sms_notifications",
    };

    const updates: NotificationPreferencesUpdate = {
      [preferenceMap[type]]: enabled,
    };

    return this.updatePreferences(userId, updates);
  }

  async ensurePreferencesExist(
    userId: string
  ): Promise<NotificationPreferences | null> {
    const { data: existingData } =
      await this.notificationPreferencesRepo.findByUserId(userId);

    if (existingData) {
      return existingData;
    }

    const { data, error } = await this.notificationPreferencesRepo.create(
      userId
    );

    if (error) {
      if ('code' in error && (error as PostgrestError).code === "23505") {
        const { data: retryData } =
          await this.notificationPreferencesRepo.findByUserId(userId);
        return retryData;
      }

      apiLogger.error("NotificationPreferencesService", "Failed to create preferences", error);
      return null;
    }

    return data;
  }
}

export const notificationPreferencesService = new NotificationPreferencesService(
  notificationPreferencesRepository
);
