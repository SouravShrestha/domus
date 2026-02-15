import { SocietyManagerInvite } from "@/types/models/manager";
import { GuardInvite } from "@/types/models/guard";
import { ApiResponse } from "@/api/types/apiResponse";

export type DetectedRole = 'resident' | 'guard' | 'manager';

export type RoleDetectionResult = {
  detectedRole: DetectedRole;
  managerInvite?: SocietyManagerInvite | null;
  guardInvite?: GuardInvite | null;
};

export interface IRoleDetectionRepository {
  findManagerInviteByPhone(phone: string): Promise<ApiResponse<SocietyManagerInvite>>;
  acceptManagerInvite(inviteId: string, userId: string): Promise<ApiResponse<void>>;
  findGuardInviteByPhone(phone: string): Promise<ApiResponse<GuardInvite>>;
  acceptGuardInvite(inviteId: string, userId: string, societyId: string): Promise<ApiResponse<void>>;
}

export interface IRoleDetectionService {
  detectAndAssignRole(userId: string, phone: string): Promise<ApiResponse<RoleDetectionResult>>;
  checkPendingInvites(phone: string): Promise<ApiResponse<RoleDetectionResult>>;
}

