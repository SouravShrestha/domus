import { supabase_client } from "@/api/client";
import { RepositoryResponse } from "@/api/interfaces/visitor.interface";
import {
  WalkInVisitorLog,
  WalkInVisitorLogWithDetails,
  CreateWalkInEntryParams,
  WalkInApprovalStatus,
} from "@/types/models/visitor";

export interface IWalkInVisitorLogRepository {
  create(
    params: CreateWalkInEntryParams
  ): Promise<RepositoryResponse<WalkInVisitorLog>>;
  findById(
    id: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails>>;
  findByResidenceId(
    residenceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>>;
  findByTempPassCode(
    passCode: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails>>;
  updateApprovalStatus(
    id: string,
    status: WalkInApprovalStatus,
    approvedByUserId?: string
  ): Promise<RepositoryResponse<WalkInVisitorLog>>;
  updateExit(
    id: string,
    exitMethod: string,
    exitGate?: string
  ): Promise<RepositoryResponse<WalkInVisitorLog>>;
  findActiveVisitors(
    residenceId: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>>;
  findPendingApprovals(
    societyId: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>>;
  findByGuardId(
    guardId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>>;
  findBySocietyId(
    societyId: string,
    limit?: number
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>>;
}

class SupabaseWalkInVisitorLogRepository
  implements IWalkInVisitorLogRepository
{
  private readonly tableName = "walk_in_visitor_logs";

  async create(
    params: CreateWalkInEntryParams & {
      temp_pass_code?: string;
      temp_pass_valid_until?: string;
    }
  ): Promise<RepositoryResponse<WalkInVisitorLog>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .insert({
        residence_id: params.residence_id,
        visitor_name: params.visitor_name,
        visitor_phone: params.visitor_phone || null,
        purpose: params.purpose || null,
        vehicle_number: params.vehicle_number || null,
        recorded_by_guard_id: params.recorded_by_guard_id,
        entry_gate: params.entry_gate || null,
        approval_status: params.approval_status,
        approved_by_resident_user_id:
          params.approved_by_resident_user_id || null,
        guard_notes: params.guard_notes || null,
        temp_pass_code: params.temp_pass_code || null,
        temp_pass_valid_until: params.temp_pass_valid_until || null,
        entry_time: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  }

  async findById(
    id: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        residence:residences(
          id,
          short_name,
          flat_number,
          block,
          society:societies(id, name)
        ),
        recorded_by_guard:society_guards!recorded_by_guard_id(
          id,
          user_id,
          user:user_profiles(id, name, phone)
        ),
        approved_by_resident:user_profiles!approved_by_resident_user_id(
          id,
          name,
          phone
        )
      `
      )
      .eq("id", id)
      .single();

    return { data, error };
  }

  async findByResidenceId(
    residenceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>> {
    let query = supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        residence:residences(
          id,
          short_name,
          flat_number,
          block,
          society:societies(id, name)
        ),
        recorded_by_guard:society_guards!recorded_by_guard_id(
          id,
          user_id,
          user:user_profiles(id, name, phone)
        ),
        approved_by_resident:user_profiles!approved_by_resident_user_id(
          id,
          name,
          phone
        )
      `
      )
      .eq("residence_id", residenceId)
      .order("entry_time", { ascending: false });

    if (startDate) {
      query = query.gte("entry_time", startDate);
    }

    if (endDate) {
      query = query.lte("entry_time", endDate);
    }

    const { data, error } = await query;

    return { data, error };
  }

  async findByTempPassCode(
    passCode: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        residence:residences(
          id,
          short_name,
          flat_number,
          block,
          society:societies(id, name)
        ),
        recorded_by_guard:society_guards!recorded_by_guard_id(
          id,
          user_id,
          user:user_profiles(id, name, phone)
        ),
        approved_by_resident:user_profiles!approved_by_resident_user_id(
          id,
          name,
          phone
        )
      `
      )
      .eq("temp_pass_code", passCode.toUpperCase())
      .single();

    return { data, error };
  }

  async updateApprovalStatus(
    id: string,
    status: WalkInApprovalStatus,
    approvedByUserId?: string
  ): Promise<RepositoryResponse<WalkInVisitorLog>> {
    const updateData: any = {
      approval_status: status,
    };

    if (status === "approved") {
      updateData.entry_method = "approved_by_owner";
    }

    if (approvedByUserId) {
      updateData.approved_by_resident_user_id = approvedByUserId;
    }

    const { data, error } = await supabase_client
      .from(this.tableName)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  }

  async updateExit(
    id: string,
    exitMethod: string,
    exitGate?: string
  ): Promise<RepositoryResponse<WalkInVisitorLog>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .update({
        exit_time: new Date().toISOString(),
        exit_method: exitMethod,
        exit_gate: exitGate || null,
      })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  }

  async findActiveVisitors(
    residenceId: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        residence:residences(
          id,
          short_name,
          flat_number,
          block,
          society:societies(id, name)
        ),
        recorded_by_guard:society_guards!recorded_by_guard_id(
          id,
          user_id,
          user:user_profiles(id, name, phone)
        ),
        approved_by_resident:user_profiles!approved_by_resident_user_id(
          id,
          name,
          phone
        )
      `
      )
      .eq("residence_id", residenceId)
      .is("exit_time", null)
      .order("entry_time", { ascending: false });

    return { data, error };
  }

  async findPendingApprovals(
    societyId: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        residence:residences!inner(
          id,
          short_name,
          flat_number,
          block,
          society:societies!inner(id, name)
        ),
        recorded_by_guard:society_guards!recorded_by_guard_id(
          id,
          user_id,
          user:user_profiles(id, name, phone)
        )
      `
      )
      .eq("residence.society.id", societyId)
      .eq("approval_status", "pending")
      .order("entry_time", { ascending: false });

    return { data, error };
  }

  async findByGuardId(
    guardId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>> {
    let query = supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        residence:residences(
          id,
          short_name,
          flat_number,
          block,
          society:societies(id, name)
        ),
        recorded_by_guard:society_guards!recorded_by_guard_id(
          id,
          user_id,
          user:user_profiles(id, name, phone)
        ),
        approved_by_resident:user_profiles!approved_by_resident_user_id(
          id,
          name,
          phone
        )
      `
      )
      .eq("recorded_by_guard_id", guardId)
      .order("entry_time", { ascending: false });

    if (startDate) {
      query = query.gte("entry_time", startDate);
    }

    if (endDate) {
      query = query.lte("entry_time", endDate);
    }

    const { data, error } = await query;

    return { data, error };
  }

  async findBySocietyId(
    societyId: string,
    limit: number = 100
  ): Promise<RepositoryResponse<WalkInVisitorLogWithDetails[]>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        residence:residences!inner(
          id,
          short_name,
          flat_number,
          block,
          society_id
        )
      `
      )
      .eq("residence.society_id", societyId)
      .in("approval_status", ["approved", "not_required"])
      .order("entry_time", { ascending: false })
      .limit(limit);

    return { data, error };
  }
}

export const walkInVisitorLogRepository =
  new SupabaseWalkInVisitorLogRepository();
