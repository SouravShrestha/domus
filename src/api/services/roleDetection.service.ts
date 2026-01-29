import { roleDetectionRepository } from "@repositories/roleDetection/roleDetection.repository";
import {
  IRoleDetectionRepository,
  IRoleDetectionService,
  RepositoryResponse,
  RoleDetectionResult,
} from "@interfaces/roleDetection.interface";

export class RoleDetectionService implements IRoleDetectionService {
  constructor(private readonly repository: IRoleDetectionRepository) {}

  async checkPendingInvites(
    phone: string
  ): Promise<RepositoryResponse<RoleDetectionResult>> {
    try {
      const { data: managerInvite, error: managerError } =
        await this.repository.findManagerInviteByPhone(phone);

      if (managerError) {
        console.error("[RoleDetection] Error checking manager invite:", managerError);
      }

      if (managerInvite) {
        return {
          data: {
            detectedRole: "manager",
            managerInvite,
          },
          error: null,
        };
      }

      return {
        data: {
          detectedRole: "resident",
          managerInvite: null,
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
  ): Promise<RepositoryResponse<RoleDetectionResult>> {
    try {
      const start = performance.now();

      const { data: result, error: checkError } =
        await this.checkPendingInvites(phone);

      if (checkError || !result) {
        return { data: null, error: checkError };
      }

      if (result.detectedRole === "manager" && result.managerInvite) {
        const { error: acceptError } = await this.repository.acceptManagerInvite(
          result.managerInvite.id,
          userId
        );

        if (acceptError) {
          console.error("[RoleDetection] Error accepting manager invite:", acceptError);
          return { data: null, error: acceptError };
        }

        const duration = performance.now() - start;
        console.log(
          `[RoleDetection] Assigned manager role in ${duration.toFixed(2)}ms`
        );

        return { data: result, error: null };
      }

      const duration = performance.now() - start;
      console.log(
        `[RoleDetection] No special role detected in ${duration.toFixed(2)}ms`
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
