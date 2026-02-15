import { ApiResponse } from "@/api/types/apiResponse";

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
  getTotalResidents(societyId: string): Promise<ApiResponse<number>>;
  getActiveVisitors(societyId: string): Promise<ApiResponse<number>>;
  getOpenComplaints(societyId: string): Promise<ApiResponse<number>>;
  getCurrentBookings(societyId: string): Promise<ApiResponse<number>>;
  getPendingApprovals(societyId: string): Promise<ApiResponse<AttentionItem[]>>;
  getRecentActivities(societyId: string, limit?: number): Promise<ApiResponse<SocietyActivity[]>>;
}

export interface IManagerDashboardService {
  getDashboardStats(societyId: string): Promise<DashboardStats>;
  getAttentionItems(societyId: string): Promise<AttentionItem[]>;
  getSocietyActivities(societyId: string, limit?: number): Promise<SocietyActivity[]>;
}
