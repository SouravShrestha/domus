import { SocietyManagerInvite } from "@/types/models/manager";
import { GuardInvite } from "@/types/models/guard";

export type RepositoryResponse<T> = {
  data: T | null;
  error: Error | null;
};

export type DetectedRole = 'resident' | 'guard' | 'manager';

export type RoleDetectionResult = {
  detectedRole: DetectedRole;
  managerInvite?: SocietyManagerInvite | null;
  guardInvite?: GuardInvite | null;
};

export interface IRoleDetectionRepository {
  findManagerInviteByPhone(phone: string): Promise<RepositoryResponse<SocietyManagerInvite>>;
  acceptManagerInvite(inviteId: string, userId: string): Promise<RepositoryResponse<void>>;
  findGuardInviteByPhone(phone: string): Promise<RepositoryResponse<GuardInvite>>;
  acceptGuardInvite(inviteId: string, userId: string, societyId: string): Promise<RepositoryResponse<void>>;
}

export interface IRoleDetectionService {
  detectAndAssignRole(userId: string, phone: string): Promise<RepositoryResponse<RoleDetectionResult>>;
  checkPendingInvites(phone: string): Promise<RepositoryResponse<RoleDetectionResult>>;
}

