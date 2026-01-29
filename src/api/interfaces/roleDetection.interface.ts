import { SocietyManagerInvite } from "@/types/models/manager";

export type RepositoryResponse<T> = {
  data: T | null;
  error: Error | null;
};

export type DetectedRole = 'resident' | 'guard' | 'manager';

export type RoleDetectionResult = {
  detectedRole: DetectedRole;
  managerInvite?: SocietyManagerInvite | null;
};

export interface IRoleDetectionRepository {
  findManagerInviteByPhone(phone: string): Promise<RepositoryResponse<SocietyManagerInvite>>;
  acceptManagerInvite(inviteId: string, userId: string): Promise<RepositoryResponse<void>>;
}

export interface IRoleDetectionService {
  detectAndAssignRole(userId: string, phone: string): Promise<RepositoryResponse<RoleDetectionResult>>;
  checkPendingInvites(phone: string): Promise<RepositoryResponse<RoleDetectionResult>>;
}
