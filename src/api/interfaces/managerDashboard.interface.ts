import { RepositoryResponse } from "./profile.interface";

export interface DashboardStats {
  totalResidents: number;
  activeVisitors: number;
  openComplaints: number;
  currentBookings: number;
}

export interface AttentionItem {
  id: string;
  type: "pending_approval" | "open_complaint" | "visitor_request" | "maintenance";
  title: string;
  description: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
  metadata?: Record<string, any>;
}

export interface SocietyActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  actorName?: string;
  actorPhotoUrl?: string;
  metadata?: Record<string, any>;
}

export interface IManagerDashboardRepository {
  getTotalResidents(societyId: string): Promise<RepositoryResponse<number>>;
  getActiveVisitors(societyId: string): Promise<RepositoryResponse<number>>;
  getOpenComplaints(societyId: string): Promise<RepositoryResponse<number>>;
  getCurrentBookings(societyId: string): Promise<RepositoryResponse<number>>;
  getPendingApprovals(societyId: string): Promise<RepositoryResponse<AttentionItem[]>>;
  getRecentActivities(societyId: string, limit?: number): Promise<RepositoryResponse<SocietyActivity[]>>;
}

export interface IManagerDashboardService {
  getDashboardStats(societyId: string): Promise<DashboardStats>;
  getAttentionItems(societyId: string): Promise<AttentionItem[]>;
  getSocietyActivities(societyId: string, limit?: number): Promise<SocietyActivity[]>;
}
