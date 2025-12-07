import { UserType } from "@/types/models/user";
import { roleDetectionRepository } from "@repositories/roleDetection/roleDetection.repository";
import {
  IRoleDetectionRepository,
  IRoleDetectionService,
  RepositoryResponse,
  RoleDetectionResult,
} from "@interfaces/roleDetection.interface";

export class RoleDetectionService implements IRoleDetectionService {
  constructor(private readonly repository: IRoleDetectionRepository) {}

  /**
   * Check if there are any pending invites for the given phone number
   * This is useful for checking role before completing registration
   */
  async checkPendingInvites(
    phone: string
  ): Promise<RepositoryResponse<RoleDetectionResult>> {
    try {
      // Check for guard invite first
      const { data: guardInvite, error: guardError } =
        await this.repository.findGuardInviteByPhone(phone);

      if (guardError) {
        console.error("[RoleDetection] Error checking guard invite:", guardError);
      }

      if (guardInvite) {
        return {
          data: {
            detectedRole: "guard",
            guardInvite,
            managerInvite: null,
          },
          error: null,
        };
      }

      // Check for manager invite
      const { data: managerInvite, error: managerError } =
        await this.repository.findManagerInviteByPhone(phone);

      if (managerError) {
        console.error("[RoleDetection] Error checking manager invite:", managerError);
      }

      if (managerInvite) {
        return {
          data: {
            detectedRole: "manager",
            guardInvite: null,
            managerInvite,
          },
          error: null,
        };
      }

      // No invites found, default to resident
      return {
        data: {
          detectedRole: "resident",
          guardInvite: null,
          managerInvite: null,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Detect role based on pending invites and assign it to the user
   * This should be called after successful authentication/registration
   */
  async detectAndAssignRole(
    userId: string,
    phone: string
  ): Promise<RepositoryResponse<RoleDetectionResult>> {
    try {
      const start = performance.now();

      // Check for pending invites
      const { data: result, error: checkError } =
        await this.checkPendingInvites(phone);

      if (checkError || !result) {
        return { data: null, error: checkError };
      }

      // If guard invite found, accept it and update user type
      if (result.detectedRole === "guard" && result.guardInvite) {
        const { error: acceptError } = await this.repository.acceptGuardInvite(
          result.guardInvite.id,
          userId
        );

        if (acceptError) {
          console.error("[RoleDetection] Error accepting guard invite:", acceptError);
          return { data: null, error: acceptError };
        }

        const { error: updateError } = await this.repository.updateUserType(
          userId,
          "guard"
        );

        if (updateError) {
          console.error("[RoleDetection] Error updating user type to guard:", updateError);
          return { data: null, error: updateError };
        }

        const duration = performance.now() - start;
        console.log(
          `[RoleDetection] Assigned guard role in ${duration.toFixed(2)}ms`
        );

        return { data: result, error: null };
      }

      // If manager invite found, accept it and update user type
      if (result.detectedRole === "manager" && result.managerInvite) {
        const { error: acceptError } = await this.repository.acceptManagerInvite(
          result.managerInvite.id,
          userId
        );

        if (acceptError) {
          console.error("[RoleDetection] Error accepting manager invite:", acceptError);
          return { data: null, error: acceptError };
        }

        const { error: updateError } = await this.repository.updateUserType(
          userId,
          "manager"
        );

        if (updateError) {
          console.error("[RoleDetection] Error updating user type to manager:", updateError);
          return { data: null, error: updateError };
        }

        const duration = performance.now() - start;
        console.log(
          `[RoleDetection] Assigned manager role in ${duration.toFixed(2)}ms`
        );

        return { data: result, error: null };
      }

      // Default: resident (no action needed, it's the default)
      const duration = performance.now() - start;
      console.log(
        `[RoleDetection] No special role detected, keeping resident in ${duration.toFixed(2)}ms`
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

