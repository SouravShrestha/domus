import type {
  GuardGateAssignment,
  GuardGateAssignmentWithDetails,
  GuardGateAssignmentCreateInput,
  GuardGateAssignmentUpdateInput,
} from '@/types';
import type { RepositoryResponse } from '../profile.interface';

export interface IGuardAssignmentRepository {
  findById(assignmentId: string): Promise<RepositoryResponse<GuardGateAssignmentWithDetails>>;
  findByGuardId(guardId: string): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>>;
  findActiveByGuardId(guardId: string): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>>;
  findBySocietyId(societyId: string): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>>;
  findByGateId(gateId: string): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>>;
  findByShiftId(shiftId: string): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>>;
  create(assignment: GuardGateAssignmentCreateInput): Promise<RepositoryResponse<GuardGateAssignment>>;
  update(assignmentId: string, assignment: GuardGateAssignmentUpdateInput): Promise<RepositoryResponse<GuardGateAssignment>>;
  delete(assignmentId: string): Promise<RepositoryResponse<void>>;
}
