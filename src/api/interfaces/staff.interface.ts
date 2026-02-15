import {
  Staff,
  StaffAssignment,
  StaffSchedule,
  StaffCategory,
  StaffAssignmentStatus,
  StaffWithAssignment,
} from "@/types/models/staff";
import { ApiResponse } from "@/api/types/apiResponse";

export type CreateStaffInput = {
  name: string;
  phone: string;
  category: StaffCategory;
  gender: string;
  photo_url?: string;
  vehicle_number?: string;
  residence_id: string;
  helper_code: string;
  created_by: string;
};

export type CreateAssignmentInput = {
  staff_id: string;
  residence_id: string;
  assigned_by: string;
  notes?: string;
};

export type CreateScheduleInput = {
  staff_assignment_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
};

export type UpdateStaffInput = Partial<Pick<Staff, 'name' | 'phone' | 'category' | 'gender' | 'photo_url' | 'vehicle_number' | 'is_access_disabled'>>;

export type UpdateAssignmentInput = Partial<Pick<StaffAssignment, 'status' | 'notes'>>;

export type UpdateScheduleInput = Partial<Pick<StaffSchedule, 'start_time' | 'end_time' | 'is_active'>>;

export interface IStaffRepository {
  findById(staffId: string): Promise<ApiResponse<Staff>>;

  findByResidenceId(residenceId: string): Promise<ApiResponse<StaffWithAssignment[]>>;

  findByPhone(phone: string, residenceId: string): Promise<ApiResponse<Staff>>;

  findByHelperCode(helperCode: string): Promise<ApiResponse<Staff>>;

  create(staff: CreateStaffInput): Promise<ApiResponse<Staff>>;

  update(staffId: string, updates: UpdateStaffInput): Promise<ApiResponse<Staff>>;

  delete(staffId: string): Promise<ApiResponse<null>>;

  findAssignmentById(assignmentId: string): Promise<ApiResponse<StaffAssignment>>;

  findAssignmentByStaffAndResidence(staffId: string, residenceId: string): Promise<ApiResponse<StaffAssignment>>;

  createAssignment(assignment: CreateAssignmentInput): Promise<ApiResponse<StaffAssignment>>;

  updateAssignment(assignmentId: string, updates: UpdateAssignmentInput): Promise<ApiResponse<StaffAssignment>>;

  deleteAssignment(assignmentId: string): Promise<ApiResponse<null>>;

  findSchedulesByAssignmentId(assignmentId: string): Promise<ApiResponse<StaffSchedule[]>>;

  createSchedule(schedule: CreateScheduleInput): Promise<ApiResponse<StaffSchedule>>;

  updateSchedule(scheduleId: string, updates: UpdateScheduleInput): Promise<ApiResponse<StaffSchedule>>;

  deleteSchedule(scheduleId: string): Promise<ApiResponse<null>>;

  upsertSchedules(assignmentId: string, schedules: Omit<CreateScheduleInput, 'staff_assignment_id'>[]): Promise<ApiResponse<StaffSchedule[]>>;
}

export interface IStaffService {
  getStaffByResidence(residenceId: string): Promise<ApiResponse<StaffWithAssignment[]>>;

  getStaffById(staffId: string): Promise<ApiResponse<Staff>>;

  addStaff(
    residenceId: string,
    userId: string,
    staffData: {
      name: string;
      phone: string;
      category: StaffCategory;
      gender: string;
      photo_url?: string;
      vehicle_number?: string;
    },
    schedules?: Omit<CreateScheduleInput, 'staff_assignment_id'>[]
  ): Promise<ApiResponse<StaffWithAssignment>>;

  updateStaff(staffId: string, updates: UpdateStaffInput): Promise<ApiResponse<Staff>>;

  removeStaffFromResidence(assignmentId: string): Promise<ApiResponse<null>>;

  updateAssignment(assignmentId: string, updates: UpdateAssignmentInput): Promise<ApiResponse<StaffAssignment>>;

  updateSchedules(assignmentId: string, schedules: Omit<CreateScheduleInput, 'staff_assignment_id'>[]): Promise<ApiResponse<StaffSchedule[]>>;

  toggleAccessTemporarily(staffId: string, isDisabled: boolean): Promise<ApiResponse<Staff>>;
}
