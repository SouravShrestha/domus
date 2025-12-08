import type {
  GuardGateAssignment,
  GuardGateAssignmentWithDetails,
  GuardGateAssignmentCreateInput,
  GuardGateAssignmentUpdateInput,
} from '@/types';
import { supabase_client } from '../../client';
import type { IGuardAssignmentRepository } from '@/api/interfaces/guardAssignment.interface';
import type { RepositoryResponse } from '@/api/interfaces/profile.interface';

export class SupabaseGuardAssignmentRepository
  implements IGuardAssignmentRepository
{
  private readonly tableName = 'guard_gate_assignments';

  private readonly selectWithDetails = `
    *,
    guard:society_guards!guard_id (
      id,
      user_id,
      society_id,
      status,
      user:users!user_id (
        id,
        name,
        phone,
        photo_url
      )
    ),
    gate:society_gates!gate_id (*),
    shift:society_shifts!shift_id (*)
  `;

  async findById(
    assignmentId: string
  ): Promise<RepositoryResponse<GuardGateAssignmentWithDetails>> {
    return supabase_client
      .from(this.tableName)
      .select(this.selectWithDetails)
      .eq('id', assignmentId)
      .single();
  }

  async findByGuardId(
    guardId: string
  ): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>> {
    return supabase_client
      .from(this.tableName)
      .select(this.selectWithDetails)
      .eq('guard_id', guardId)
      .order('effective_from', { ascending: false });
  }

  async findActiveByGuardId(
    guardId: string
  ): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>> {
    const today = new Date().toISOString().split('T')[0];

    return supabase_client
      .from(this.tableName)
      .select(this.selectWithDetails)
      .eq('guard_id', guardId)
      .eq('is_active', true)
      .lte('effective_from', today)
      .or(`effective_until.is.null,effective_until.gte.${today}`)
      .order('effective_from', { ascending: false });
  }

  async findBySocietyId(
    societyId: string
  ): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>> {
    return supabase_client
      .from(this.tableName)
      .select(this.selectWithDetails)
      .eq('guard.society_id', societyId)
      .order('created_at', { ascending: false });
  }

  async findByGateId(
    gateId: string
  ): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>> {
    return supabase_client
      .from(this.tableName)
      .select(this.selectWithDetails)
      .eq('gate_id', gateId)
      .order('effective_from', { ascending: false });
  }

  async findByShiftId(
    shiftId: string
  ): Promise<RepositoryResponse<GuardGateAssignmentWithDetails[]>> {
    return supabase_client
      .from(this.tableName)
      .select(this.selectWithDetails)
      .eq('shift_id', shiftId)
      .order('effective_from', { ascending: false });
  }

  async create(
    assignment: GuardGateAssignmentCreateInput
  ): Promise<RepositoryResponse<GuardGateAssignment>> {
    return supabase_client
      .from(this.tableName)
      .insert(assignment)
      .select()
      .single();
  }

  async update(
    assignmentId: string,
    assignment: GuardGateAssignmentUpdateInput
  ): Promise<RepositoryResponse<GuardGateAssignment>> {
    return supabase_client
      .from(this.tableName)
      .update(assignment)
      .eq('id', assignmentId)
      .select()
      .single();
  }

  async delete(assignmentId: string): Promise<RepositoryResponse<void>> {
    const { error } = await supabase_client
      .from(this.tableName)
      .delete()
      .eq('id', assignmentId);

    return { data: null, error };
  }
}

export const guardAssignmentRepository =
  new SupabaseGuardAssignmentRepository();
