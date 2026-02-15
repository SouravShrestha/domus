import { Notification } from "@models/notification";
import { notificationRepository } from "@repositories/notification/notification.repository";
import { INotificationRepository, INotificationService } from "@interfaces/notification.interface";
import { getCurrentUserId } from '@/api/utils/getCurrentUser';
import { appCache } from '@/api/utils/cache';
import { apiLogger } from '@/api/utils/logger';

const CACHE_PREFIX = 'notifications';
const UNREAD_COUNT_TTL = 30_000;

const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 20;

export class NotificationService implements INotificationService {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async getMyNotifications(
    skip: number = DEFAULT_SKIP,
    take: number = DEFAULT_TAKE
  ): Promise<Notification[]> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      apiLogger.error("NotificationService", "Failed to get current user");
      return [];
    }

    const { data, error } = await this.notificationRepo.findByUserId(userId, skip, take);

    if (error) {
      apiLogger.error("NotificationService", "Failed to fetch notifications", error);
      return [];
    }

    return data || [];
  }

  async markAsRead(id: string): Promise<void> {
    const { error } = await this.notificationRepo.markAsRead(id);
    if (error) {
      apiLogger.error("NotificationService", "Failed to mark notification as read", error);
    }
    appCache.invalidateByPrefix(CACHE_PREFIX);
  }

  async markAllAsRead(): Promise<void> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      apiLogger.error("NotificationService", "Failed to get current user");
      return;
    }

    const { error } = await this.notificationRepo.markAllAsRead(userId);
    if (error) {
      apiLogger.error("NotificationService", "Failed to mark all as read", error);
    }
    appCache.invalidateByPrefix(CACHE_PREFIX);
  }

  async getUnreadCount(): Promise<number> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      apiLogger.error("NotificationService", "Failed to get current user");
      return 0;
    }

    return appCache.getOrFetch(
      `${CACHE_PREFIX}:unread:${userId}`,
      async () => {
        const { data, error } = await this.notificationRepo.getUnreadCount(userId);
        if (error) {
          apiLogger.error("NotificationService", "Failed to get unread count", error);
          return 0;
        }
        return data || 0;
      },
      UNREAD_COUNT_TTL
    );
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
