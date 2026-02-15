import { Notification } from "@models/notification";
import { ApiResponse } from "@/api/types/apiResponse";

export interface INotificationRepository {
  findByUserId(userId: string, skip: number, take: number): Promise<ApiResponse<Notification[]>>;
  markAsRead(id: string): Promise<ApiResponse<void>>;
  markAllAsRead(userId: string): Promise<ApiResponse<void>>;
  getUnreadCount(userId: string): Promise<ApiResponse<number>>;
}

export interface INotificationService {
  getMyNotifications(skip?: number, take?: number): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  getUnreadCount(): Promise<number>;
}
