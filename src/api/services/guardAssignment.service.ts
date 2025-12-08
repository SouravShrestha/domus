import type {
  GuardGateAssignment,
  GuardGateAssignmentWithDetails,
  GuardGateAssignmentCreateInput,
  GuardGateAssignmentUpdateInput,
  DayOfWeek,
} from '@/types';
import { guardAssignmentRepository } from '@/api/repositories/guardAssignment/guardAssignment.repository';

type RepositoryResponse<T> = {
  data: T | null;
  error: Error | null;
};

export async function getAssignmentById(
  assignmentId: string
): Promise<RepositoryResponse<GuardGateAssignmentWithDetails>> {
  try {
    const { data, error } =
      await guardAssignmentRepository.findById(assignmentId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getAssignmentsByGuardId(
  guardId: string
): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>> {
  try {
    const { data, error } =
      await guardAssignmentRepository.findByGuardId(guardId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getActiveAssignmentsByGuardId(
  guardId: string
): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>> {
  try {
    const { data, error } =
      await guardAssignmentRepository.findActiveByGuardId(guardId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getAssignmentsBySocietyId(
  societyId: string
): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>> {
  try {
    const { data, error } =
      await guardAssignmentRepository.findBySocietyId(societyId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getAssignmentsByGateId(
  gateId: string
): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>> {
  try {
    const { data, error } =
      await guardAssignmentRepository.findByGateId(gateId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getAssignmentsByShiftId(
  shiftId: string
): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>> {
  try {
    const { data, error } =
      await guardAssignmentRepository.findByShiftId(shiftId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createAssignment(
  assignment: GuardGateAssignmentCreateInput
): Promise<RepositoryResponse<GuardGateAssignment>> {
  try {
    const { data, error } = await guardAssignmentRepository.create(assignment);

    if (error) {
      if (error.message.includes('already has an assignment')) {
        return {
          data: null,
          error: new Error(
            'This guard is already assigned to a gate during this shift for one or more of the selected days'
          ),
        };
      }
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function updateAssignment(
  assignmentId: string,
  assignment: GuardGateAssignmentUpdateInput
): Promise<RepositoryResponse<GuardGateAssignment>> {
  try {
    const { data, error } = await guardAssignmentRepository.update(
      assignmentId,
      assignment
    );

    if (error) {
      if (error.message.includes('already has an assignment')) {
        return {
          data: null,
          error: new Error(
            'This guard is already assigned to a gate during this shift for one or more of the selected days'
          ),
        };
      }
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function deleteAssignment(
  assignmentId: string
): Promise<RepositoryResponse<void>> {
  try {
    const { error } = await guardAssignmentRepository.delete(assignmentId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function deactivateAssignment(
  assignmentId: string
): Promise<RepositoryResponse<GuardGateAssignment>> {
  return updateAssignment(assignmentId, { is_active: false });
}

export async function activateAssignment(
  assignmentId: string
): Promise<RepositoryResponse<GuardGateAssignment>> {
  return updateAssignment(assignmentId, { is_active: true });
}

export async function getCurrentAssignmentForGuard(
  guardId: string
): Promise<RepositoryResponse<GuardGateAssignmentWithDetails | null>> {
  try {
    const { data, error } = await getActiveAssignmentsByGuardId(guardId);

    if (error) {
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      return { data: null, error: null };
    }

    const today = new Date().getDay() as DayOfWeek;
    const currentAssignment = data.find((assignment) =>
      assignment.days_of_week.includes(today)
    );

    return { data: currentAssignment || data[0], error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
