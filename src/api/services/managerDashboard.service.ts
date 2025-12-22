import {
  DashboardStats,
  AttentionItem,
  SocietyActivity,
  IManagerDashboardService,
} from "@interfaces/managerDashboard.interface";
import { managerDashboardRepository, ManagerDashboardRepository } from "@repositories/managerDashboard/managerDashboard.repository";

export class ManagerDashboardService implements IManagerDashboardService {
  constructor(private readonly repo: ManagerDashboardRepository) {}

  async getDashboardStats(societyId: string): Promise<DashboardStats> {
    const [residents, visitors, complaints, bookings] = await Promise.all([
      this.repo.getTotalResidents(societyId),
      this.repo.getActiveVisitors(societyId),
      this.repo.getOpenComplaints(societyId),
      this.repo.getCurrentBookings(societyId),
    ]);

    return {
      totalResidents: residents.data || 0,
      activeVisitors: visitors.data || 0,
      openComplaints: complaints.data || 0,
      currentBookings: bookings.data || 0,
    };
  }

  async getAttentionItems(societyId: string): Promise<AttentionItem[]> {
    const [pendingApprovals, openComplaints] = await Promise.all([
      this.repo.getPendingApprovals(societyId),
      this.repo.getOpenComplaintsForAttention(societyId),
    ]);

    const allItems = [
      ...(pendingApprovals.data || []),
      ...(openComplaints.data || []),
    ];

    return allItems
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, 10);
  }

  async getSocietyActivities(societyId: string, limit: number = 20): Promise<SocietyActivity[]> {
    const { data } = await this.repo.getRecentActivities(societyId, limit);
    return data || [];
  }
}

const managerDashboardService = new ManagerDashboardService(managerDashboardRepository);

export const getDashboardStats = (societyId: string) =>
  managerDashboardService.getDashboardStats(societyId);

export const getAttentionItems = (societyId: string) =>
  managerDashboardService.getAttentionItems(societyId);

export const getSocietyActivities = (societyId: string, limit?: number) =>
  managerDashboardService.getSocietyActivities(societyId, limit);

export { managerDashboardService };
