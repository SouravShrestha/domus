import { complaintRepository, ComplaintRepository } from "@/api/repositories/complaint/complaint.repository";
import { CreateComplaintDto, VoteType } from "@/api/interfaces/complaint.interface";

export class ComplaintService {
  constructor(private readonly repo: ComplaintRepository) {}

  async createComplaint(complaint: CreateComplaintDto) {
    return this.repo.create(complaint);
  }

  async getSocietyComplaints(societyId: string, userId?: string) {
    return this.repo.findBySocietyId(societyId, userId);
  }

  async getUserComplaints(userId: string) {
    return this.repo.findByUserId(userId);
  }

  async getResidenceAndSocietyComplaints(userId: string, societyId: string) {
    return this.repo.findByResidenceAndSociety(userId, societyId);
  }

  async voteComplaint(complaintId: string, userId: string, voteType: VoteType) {
    return this.repo.vote(complaintId, userId, voteType);
  }

  async removeVote(complaintId: string, userId: string) {
    return this.repo.removeVote(complaintId, userId);
  }

  async getVoteCounts(complaintId: string) {
    return this.repo.getVoteCounts(complaintId);
  }

  async getUserVote(complaintId: string, userId: string) {
    return this.repo.getUserVote(complaintId, userId);
  }
}

export const complaintService = new ComplaintService(complaintRepository);

export const createComplaint = (complaint: CreateComplaintDto) =>
  complaintService.createComplaint(complaint);

export const getSocietyComplaints = (societyId: string, userId?: string) =>
  complaintService.getSocietyComplaints(societyId, userId);

export const getUserComplaints = (userId: string) =>
  complaintService.getUserComplaints(userId);

export const getResidenceAndSocietyComplaints = (userId: string, societyId: string) =>
  complaintService.getResidenceAndSocietyComplaints(userId, societyId);

export const voteComplaint = (complaintId: string, userId: string, voteType: VoteType) =>
  complaintService.voteComplaint(complaintId, userId, voteType);

export const removeVote = (complaintId: string, userId: string) =>
  complaintService.removeVote(complaintId, userId);
