import {
  IWalkInVisitorLogRepository,
  walkInVisitorLogRepository,
} from "@/api/repositories/visitor/walkInVisitorLog.repository";
import { RepositoryResponse } from "@/api/interfaces/visitor.interface";
import {
  WalkInVisitorLog,
  WalkInVisitorLogWithDetails,
  CreateWalkInEntryParams,
  WalkInApprovalStatus,
} from "@/types/models/visitor";
import { logActivity } from "./activity.service";
import { ActivityType } from "@/types/models/activity";
import { appEventEmitter, AppEvents } from "@/utils/eventEmitter";

const MAX_CODE_GENERATION_ATTEMPTS = 10;
const TEMP_PASS_VALIDITY_HOURS = 24;

export class WalkInVisitorService {
  constructor(private readonly logRepo: IWalkInVisitorLogRepository) {}

  async createWalkInEntry(
    params: CreateWalkInEntryParams & {
      temp_pass_code?: string;
      temp_pass_valid_until?: string;
    }
  ): Promise<RepositoryResponse<WalkInVisitorLog>> {
    // Generate temporary pass code
    const tempPassCode = await this.generateUniqueTempPassCode();
    const tempPassValidUntil = new Date();
    tempPassValidUntil.setHours(
      tempPassValidUntil.getHours() + TEMP_PASS_VALIDITY_HOURS
    );

    // Include temp pass in initial creation
    const createParams = {
      ...params,
      temp_pass_code: tempPassCode,
      temp_pass_valid_until: tempPassValidUntil.toISOString(),
    };

    const result = await this.logRepo.create(createParams as any);

    if (result.data) {
      // Log activity
      await logActivity(
        params.residence_id,
        null, // No user ID for walk-in entries
        ActivityType.WALK_IN_VISITOR_ENTRY,
        params.visitor_name,
        {
          visitor_name: params.visitor_name,
          visitor_phone: params.visitor_phone,
          purpose: params.purpose,
          approval_status: params.approval_status,
          temp_pass_code: tempPassCode,
        }
      );

      appEventEmitter.emit(AppEvents.GUEST_INVITATION_CREATED);
      appEventEmitter.emit(AppEvents.ACTIVITIES_UPDATED);
    }

    return result;
  }

  async approveWalkInEntry(
    logId: string,
    approvedByUserId: string,
    residenceId: string,
    visitorName: string
  ): Promise<RepositoryResponse<WalkInVisitorLog>> {
    const result = await this.logRepo.updateApprovalStatus(
      logId,
      "approved",
      approvedByUserId
    );

    if (result.data) {
      await logActivity(
        residenceId,
        approvedByUserId,
        ActivityType.WALK_IN_VISITOR_APPROVED,
        visitorName,
        {
          visitor_name: visitorName,
        }
      );

      appEventEmitter.emit(AppEvents.ACTIVITIES_UPDATED);
    }

    return result;
  }

  async rejectWalkInEntry(
    logId: string,
    rejectedByUserId: string,
    residenceId: string,
    visitorName: string
  ): Promise<RepositoryResponse<WalkInVisitorLog>> {
    const result = await this.logRepo.updateApprovalStatus(
      logId,
      "rejected",
      rejectedByUserId
    );

    if (result.data) {
      await logActivity(
        residenceId,
        rejectedByUserId,
        ActivityType.WALK_IN_VISITOR_REJECTED,
        visitorName,
        {
          visitor_name: visitorName,
        }
      );

      appEventEmitter.emit(AppEvents.ACTIVITIES_UPDATED);
    }

    return result;
  }

  async recordExit(
    logId: string,
    exitMethod: string,
    exitGate?: string
  ): Promise<RepositoryResponse<WalkInVisitorLog>> {
    return this.logRepo.updateExit(logId, exitMethod, exitGate);
  }

  async getWalkInLogById(
    id: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails>> {
    return this.logRepo.findById(id);
  }

  async getWalkInLogByTempPassCode(
    passCode: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails>> {
    return this.logRepo.findByTempPassCode(passCode);
  }

  async getResidenceWalkInHistory(
    residenceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>> {
    return this.logRepo.findByResidenceId(residenceId, startDate, endDate);
  }

  async getActiveWalkInVisitors(
    residenceId: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>> {
    return this.logRepo.findActiveVisitors(residenceId);
  }

  async getPendingApprovals(
    societyId: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>> {
    return this.logRepo.findPendingApprovals(societyId);
  }

  async getGuardWalkInHistory(
    guardId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>> {
    return this.logRepo.findByGuardId(guardId, startDate, endDate);
  }

  private async generateUniqueTempPassCode(): Promise<string> {
    for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
      const code = this.generateTempPassCode();
      const { data } = await this.logRepo.findByTempPassCode(code);

      if (!data) {
        return code;
      }
    }

    throw new Error("Failed to generate unique temporary pass code");
  }

  private generateTempPassCode(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
}

const walkInVisitorService = new WalkInVisitorService(
  walkInVisitorLogRepository
);

export const createWalkInEntry = (params: CreateWalkInEntryParams) =>
  walkInVisitorService.createWalkInEntry(params);

export const approveWalkInEntry = (
  logId: string,
  approvedByUserId: string,
  residenceId: string,
  visitorName: string
) =>
  walkInVisitorService.approveWalkInEntry(
    logId,
    approvedByUserId,
    residenceId,
    visitorName
  );

export const rejectWalkInEntry = (
  logId: string,
  rejectedByUserId: string,
  residenceId: string,
  visitorName: string
) =>
  walkInVisitorService.rejectWalkInEntry(
    logId,
    rejectedByUserId,
    residenceId,
    visitorName
  );

export const recordWalkInExit = (
  logId: string,
  exitMethod: string,
  exitGate?: string
) => walkInVisitorService.recordExit(logId, exitMethod, exitGate);

export const getWalkInLogById = (id: string) =>
  walkInVisitorService.getWalkInLogById(id);

export const getWalkInLogByTempPassCode = (passCode: string) =>
  walkInVisitorService.getWalkInLogByTempPassCode(passCode);

export const getResidenceWalkInHistory = (
  residenceId: string,
  startDate?: string,
  endDate?: string
) =>
  walkInVisitorService.getResidenceWalkInHistory(
    residenceId,
    startDate,
    endDate
  );

export const getActiveWalkInVisitors = (residenceId: string) =>
  walkInVisitorService.getActiveWalkInVisitors(residenceId);

export const getPendingWalkInApprovals = (societyId: string) =>
  walkInVisitorService.getPendingApprovals(societyId);

export const getGuardWalkInHistory = (
  guardId: string,
  startDate?: string,
  endDate?: string
) => walkInVisitorService.getGuardWalkInHistory(guardId, startDate, endDate);

export { walkInVisitorService };
