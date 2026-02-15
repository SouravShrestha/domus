import { roleDetectionRepository } from "@repositories/roleDetection/roleDetection.repository";
import {
  IRoleDetectionRepository,
  IRoleDetectionService,
  RoleDetectionResult,
} from "@interfaces/roleDetection.interface";
import { ApiResponse } from "@/api/types/apiResponse";
import { apiLogger } from '@/api/utils/logger';

export class RoleDetectionService implements IRoleDetectionService {
  constructor(private readonly repository: IRoleDetectionRepository) {}

  async checkPendingInvites(
    phone: string
  ): Promise<ApiResponse<RoleDetectionResult>> {
    try {
      // Check for manager invites first (higher priority)
      const { data: managerInvite, error: managerError } =
        await this.repository.findManagerInviteByPhone(phone);

      if (managerError) {
        apiLogger.error("RoleDetectionService", "Error checking manager invite", managerError);
      }

      if (managerInvite) {
        return {
          data: {
            detectedRole: "manager",
            managerInvite,
            guardInvite: null,
          },
          error: null,
        };
      }

      // Check for guard invites
      const { data: guardInvite, error: guardError } =
        await this.repository.findGuardInviteByPhone(phone);

      if (guardError) {
        apiLogger.error("RoleDetectionService", "Error checking guard invite", guardError);
      }

      if (guardInvite) {
        return {
          data: {
            detectedRole: "guard",
            managerInvite: null,
            guardInvite,
          },
          error: null,
        };
      }

      return {
        data: {
          detectedRole: "resident",
          managerInvite: null,
          guardInvite: null,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async detectAndAssignRole(
    userId: string,
    phone: string
  ): Promise<ApiResponse<RoleDetectionResult>> {
    try {
      const start = performance.now();

      const { data: result, error: checkError } =
        await this.checkPendingInvites(phone);

      if (checkError || !result) {
        return { data: null, error: checkError };
      }

      // Handle manager invite auto-accept
      if (result.detectedRole === "manager" && result.managerInvite) {
        const { error: acceptError } = await this.repository.acceptManagerInvite(
          result.managerInvite.id,
          userId
        );

        if (acceptError) {
          apiLogger.error("RoleDetectionService", "Error accepting manager invite", acceptError);
          return { data: null, error: acceptError };
        }

        const duration = performance.now() - start;
        apiLogger.info(
          "RoleDetectionService", `Assigned manager role in ${duration.toFixed(2)}ms`
        );

        return { data: result, error: null };
      }

      // Handle guard invite auto-accept
      if (result.detectedRole === "guard" && result.guardInvite) {
        const { error: acceptError } = await this.repository.acceptGuardInvite(
          result.guardInvite.id,
          userId,
          result.guardInvite.society_id
        );

        if (acceptError) {
          apiLogger.error("RoleDetectionService", "Error accepting guard invite", acceptError);
          return { data: null, error: acceptError };
        }

        const duration = performance.now() - start;
        apiLogger.info(
          "RoleDetectionService", `Assigned guard role in ${duration.toFixed(2)}ms`
        );

        return { data: result, error: null };
      }

      const duration = performance.now() - start;
      apiLogger.info(
        "RoleDetectionService", `No special role detected in ${duration.toFixed(2)}ms`
      );

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

const roleDetectionService = new RoleDetectionService(roleDetectionRepository);

export const detectAndAssignRole = (userId: string, phone: string) =>
  roleDetectionService.detectAndAssignRole(userId, phone);

export const checkPendingInvites = (phone: string) =>
  roleDetectionService.checkPendingInvites(phone);

export { roleDetectionService };

