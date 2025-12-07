import { UserType } from "@/types/models/user";
import { SocietyGuardInvite } from "@/types/models/guard";
import { SocietyManagerInvite } from "@/types/models/manager";

export type RepositoryResponse<T> = {
  data: T | null;
  error: Error | null;
};

export type RoleDetectionResult = {
  detectedRole: UserType;
  guardInvite?: SocietyGuardInvite | null;
  managerInvite?: SocietyManagerInvite | null;
};

export interface IRoleDetectionRepository {
  findGuardInviteByPhone(phone: string): Promise<RepositoryResponse<SocietyGuardInvite>>;
  findManagerInviteByPhone(phone: string): Promise<RepositoryResponse<SocietyManagerInvite>>;
  acceptGuardInvite(inviteId: string, userId: string): Promise<RepositoryResponse<void>>;
  acceptManagerInvite(inviteId: string, userId: string): Promise<RepositoryResponse<void>>;
  updateUserType(userId: string, userType: UserType): Promise<RepositoryResponse<void>>;
}

export interface IRoleDetectionService {
  detectAndAssignRole(userId: string, phone: string): Promise<RepositoryResponse<RoleDetectionResult>>;
  checkPendingInvites(phone: string): Promise<RepositoryResponse<RoleDetectionResult>>;
}

