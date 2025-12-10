import { Notification } from "@models/notification";
import { RepositoryResponse } from "./profile.interface";

export interface INotificationRepository {
  findByUserId(userId: string, skip: number, take: number): Promise<RepositoryResponse<Notification[]>>;
  markAsRead(id: string): Promise<RepositoryResponse<void>>;
  markAllAsRead(userId: string): Promise<RepositoryResponse<void>>;
  getUnreadCount(userId: string): Promise<RepositoryResponse<number>>;
}

export interface INotificationService {
  getMyNotifications(skip?: number, take?: number): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  getUnreadCount(): Promise<number>;
}
