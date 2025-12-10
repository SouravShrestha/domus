import { Notification } from "@models/notification";
import { notificationRepository } from "@repositories/notification/notification.repository";
import { INotificationRepository, INotificationService } from "@interfaces/notification.interface";
import { supabase_client } from "../client";

const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 20;

export class NotificationService implements INotificationService {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async getMyNotifications(
    skip: number = DEFAULT_SKIP,
    take: number = DEFAULT_TAKE
  ): Promise<Notification[]> {
    const { data: { user }, error: userError } = await supabase_client.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      return [];
    }

    const { data, error } = await this.notificationRepo.findByUserId(user.id, skip, take);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data || [];
  }

  async markAsRead(id: string): Promise<void> {
    const { error } = await this.notificationRepo.markAsRead(id);
    if (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  async markAllAsRead(): Promise<void> {
    const { data: { user }, error: userError } = await supabase_client.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      return;
    }

    const { error } = await this.notificationRepo.markAllAsRead(user.id);
    if (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  async getUnreadCount(): Promise<number> {
    const { data: { user }, error: userError } = await supabase_client.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      return 0;
    }

    const { data, error } = await this.notificationRepo.getUnreadCount(user.id);
    if (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }

    return data || 0;
  }
}

const notificationServiceInstance = new NotificationService(notificationRepository);

export const getMyNotifications = (skip?: number, take?: number) =>
  notificationServiceInstance.getMyNotifications(skip, take);

export const markAsRead = (id: string) =>
  notificationServiceInstance.markAsRead(id);

export const markAllAsRead = () =>
  notificationServiceInstance.markAllAsRead();

export const getUnreadCount = () =>
  notificationServiceInstance.getUnreadCount();

export { notificationServiceInstance as notificationService };
