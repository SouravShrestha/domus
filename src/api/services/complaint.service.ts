import { complaintRepository, ComplaintRepository } from "@/api/repositories/complaint/complaint.repository";
import { CreateComplaintDto } from "@/api/interfaces/complaint.interface";

export class ComplaintService {
  constructor(private readonly repo: ComplaintRepository) {}

  async createComplaint(complaint: CreateComplaintDto & { user_id: string }) {
    return this.repo.create(complaint);
  }

  async getSocietyComplaints(societyId: string) {
    return this.repo.findBySocietyId(societyId);
  }

  async getUserComplaints(userId: string) {
    return this.repo.findByUserId(userId);
  }
}

export const complaintService = new ComplaintService(complaintRepository);

export const createComplaint = (complaint: CreateComplaintDto & { user_id: string }) =>
  complaintService.createComplaint(complaint);

export const getSocietyComplaints = (societyId: string) =>
  complaintService.getSocietyComplaints(societyId);

export const getUserComplaints = (userId: string) =>
  complaintService.getUserComplaints(userId);
