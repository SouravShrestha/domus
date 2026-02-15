import { supabase_client } from "@api/client";
import {
  Staff,
  StaffAssignment,
  StaffSchedule,
  StaffWithAssignment,
} from "@/types/models/staff";
import {
  IStaffRepository,
  CreateStaffInput,
  CreateAssignmentInput,
  CreateScheduleInput,
  UpdateStaffInput,
  UpdateAssignmentInput,
  UpdateScheduleInput,
} from "@interfaces/staff.interface";
import { ApiResponse } from "@/api/types/apiResponse";

export class StaffRepository implements IStaffRepository {
  async findById(staffId: string): Promise<ApiResponse<Staff>> {
    try {
      const { data, error } = await supabase_client
        .from("staff")
        .select("*")
        .eq("id", staffId)
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Staff, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async findByResidenceId(residenceId: string): Promise<ApiResponse<StaffWithAssignment[]>> {
    try {
      const { data, error } = await supabase_client
        .from("staff_assignment")
        .select(`
          *,
          staff:staff(*),
          schedules:staff_schedule(*)
        `)
        .eq("residence_id", residenceId)
        .neq("status", "removed")
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      const staffList: StaffWithAssignment[] = (data || []).map((item: any) => ({
        ...item.staff,
        assignment: {
          id: item.id,
          staff_id: item.staff_id,
          residence_id: item.residence_id,
          assigned_by: item.assigned_by,
          status: item.status,
          notes: item.notes,
          created_at: item.created_at,
          updated_at: item.updated_at,
        },
        schedules: item.schedules || [],
      }));

      return { data: staffList, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async findByPhone(phone: string, residenceId: string): Promise<ApiResponse<Staff>> {
    try {
      const { data, error } = await supabase_client
        .from("staff")
        .select("*")
        .eq("phone", phone)
        .eq("residence_id", residenceId)
        .single();

      if (error && error.code !== "PGRST116") {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Staff | null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async findByHelperCode(helperCode: string): Promise<ApiResponse<Staff>> {
    try {
      const { data, error } = await supabase_client
        .from("staff")
        .select("*")
        .eq("helper_code", helperCode)
        .single();

      if (error && error.code !== "PGRST116") {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Staff | null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async create(staff: CreateStaffInput): Promise<ApiResponse<Staff>> {
    try {
      const { data, error } = await supabase_client
        .from("staff")
        .insert(staff)
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Staff, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async update(staffId: string, updates: UpdateStaffInput): Promise<ApiResponse<Staff>> {
    try {
      const { data, error } = await supabase_client
        .from("staff")
        .update(updates)
        .eq("id", staffId)
        .select();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      if (!data || data.length === 0) {
        return { data: null, error: new Error("Staff not found") };
      }

      return { data: data[0] as Staff, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async delete(staffId: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase_client
        .from("staff")
        .delete()
        .eq("id", staffId);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async findAssignmentById(assignmentId: string): Promise<ApiResponse<StaffAssignment>> {
    try {
      const { data, error } = await supabase_client
        .from("staff_assignment")
        .select("*")
        .eq("id", assignmentId)
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as StaffAssignment, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async findAssignmentByStaffAndResidence(
    staffId: string, 
    residenceId: string
  ): Promise<ApiResponse<StaffAssignment>> {
    try {
      const { data, error } = await supabase_client
        .from("staff_assignment")
        .select("*")
        .eq("staff_id", staffId)
        .eq("residence_id", residenceId)
        .single();

      if (error && error.code !== "PGRST116") {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as StaffAssignment | null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async createAssignment(assignment: CreateAssignmentInput): Promise<ApiResponse<StaffAssignment>> {
    try {
      const { data, error } = await supabase_client
        .from("staff_assignment")
        .insert(assignment)
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as StaffAssignment, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateAssignment(
    assignmentId: string, 
    updates: UpdateAssignmentInput
  ): Promise<ApiResponse<StaffAssignment>> {
    try {
      const { data, error } = await supabase_client
        .from("staff_assignment")
        .update(updates)
        .eq("id", assignmentId)
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as StaffAssignment, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteAssignment(assignmentId: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase_client
        .from("staff_assignment")
        .delete()
        .eq("id", assignmentId);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async findSchedulesByAssignmentId(assignmentId: string): Promise<ApiResponse<StaffSchedule[]>> {
    try {
      const { data, error } = await supabase_client
        .from("staff_schedule")
        .select("*")
        .eq("staff_assignment_id", assignmentId)
        .order("day_of_week", { ascending: true });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as StaffSchedule[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async createSchedule(schedule: CreateScheduleInput): Promise<ApiResponse<StaffSchedule>> {
    try {
      const { data, error } = await supabase_client
        .from("staff_schedule")
        .insert(schedule)
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as StaffSchedule, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateSchedule(
    scheduleId: string, 
    updates: UpdateScheduleInput
  ): Promise<ApiResponse<StaffSchedule>> {
    try {
      const { data, error } = await supabase_client
        .from("staff_schedule")
        .update(updates)
        .eq("id", scheduleId)
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as StaffSchedule, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteSchedule(scheduleId: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase_client
        .from("staff_schedule")
        .delete()
        .eq("id", scheduleId);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async upsertSchedules(
    assignmentId: string, 
    schedules: Omit<CreateScheduleInput, 'staff_assignment_id'>[]
  ): Promise<ApiResponse<StaffSchedule[]>> {
    try {
      await supabase_client
        .from("staff_schedule")
        .delete()
        .eq("staff_assignment_id", assignmentId);

      if (schedules.length === 0) {
        return { data: [], error: null };
      }

      const schedulesWithAssignment = schedules.map(s => ({
        ...s,
        staff_assignment_id: assignmentId,
      }));

      const { data, error } = await supabase_client
        .from("staff_schedule")
        .insert(schedulesWithAssignment)
        .select();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as StaffSchedule[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

export const staffRepository = new StaffRepository();
