import {
  NotificationPreferences,
  NotificationPreferencesUpdate,
} from "@models/notificationPreferences";
import {
  INotificationPreferencesRepository,
  INotificationPreferencesService,
} from "@interfaces/notificationPreferences.interface";
import { notificationPreferencesRepository } from "@repositories/notification/notificationPreferences.repository";
import { supabase_client } from "../client";

export class NotificationPreferencesService
  implements INotificationPreferencesService
{
  constructor(
    private readonly notificationPreferencesRepo: INotificationPreferencesRepository
  ) {}

  async getCurrentUserPreferences(): Promise<NotificationPreferences | null> {
    const {
      data: { user },
    } = await supabase_client.auth.getUser();

    if (!user?.id) {
      return null;
    }

    return this.getPreferencesByUserId(user.id);
  }

  async getPreferencesByUserId(
    userId: string
  ): Promise<NotificationPreferences | null> {
    const { data, error } =
      await this.notificationPreferencesRepo.findByUserId(userId);

    if (error) {
      if (error.code === "PGRST116") {
        return this.ensurePreferencesExist(userId);
      }
      console.error("Error fetching notification preferences:", error);
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
      if (error.code === "PGRST116") {
        const { data: createdData, error: createError } =
          await this.notificationPreferencesRepo.create(userId, preferences);

        if (createError) {
          console.error("Error creating notification preferences:", createError);
          throw createError;
        }

        return createdData;
      }

      console.error("Error updating notification preferences:", error);
      throw error;
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
      if (error.code === "23505") {
        const { data: retryData } =
          await this.notificationPreferencesRepo.findByUserId(userId);
        return retryData;
      }

      console.error("Error creating notification preferences:", error);
      return null;
    }

    return data;
  }
}

export const notificationPreferencesService = new NotificationPreferencesService(
  notificationPreferencesRepository
);
