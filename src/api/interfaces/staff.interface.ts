import {
  Staff,
  StaffAssignment,
  StaffSchedule,
  StaffCategory,
  StaffAssignmentStatus,
  StaffWithAssignment,
} from "@/types/models/staff";

export type RepositoryResponse<T> = {
  data: T | null;
  error: Error | null;
};

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
  findById(staffId: string): Promise<RepositoryResponse<Staff>>;

  findByResidenceId(residenceId: string): Promise<RepositoryResponse<StaffWithAssignment[]>>;

  findByPhone(phone: string, residenceId: string): Promise<RepositoryResponse<Staff>>;

  findByHelperCode(helperCode: string): Promise<RepositoryResponse<Staff>>;

  create(staff: CreateStaffInput): Promise<RepositoryResponse<Staff>>;

  update(staffId: string, updates: UpdateStaffInput): Promise<RepositoryResponse<Staff>>;

  delete(staffId: string): Promise<RepositoryResponse<null>>;

  findAssignmentById(assignmentId: string): Promise<RepositoryResponse<StaffAssignment>>;

  findAssignmentByStaffAndResidence(staffId: string, residenceId: string): Promise<RepositoryResponse<StaffAssignment>>;

  createAssignment(assignment: CreateAssignmentInput): Promise<RepositoryResponse<StaffAssignment>>;

  updateAssignment(assignmentId: string, updates: UpdateAssignmentInput): Promise<RepositoryResponse<StaffAssignment>>;

  deleteAssignment(assignmentId: string): Promise<RepositoryResponse<null>>;

  findSchedulesByAssignmentId(assignmentId: string): Promise<RepositoryResponse<StaffSchedule[]>>;

  createSchedule(schedule: CreateScheduleInput): Promise<RepositoryResponse<StaffSchedule>>;

  updateSchedule(scheduleId: string, updates: UpdateScheduleInput): Promise<RepositoryResponse<StaffSchedule>>;

  deleteSchedule(scheduleId: string): Promise<RepositoryResponse<null>>;

  upsertSchedules(assignmentId: string, schedules: Omit<CreateScheduleInput, 'staff_assignment_id'>[]): Promise<RepositoryResponse<StaffSchedule[]>>;
}

export interface IStaffService {
  getStaffByResidence(residenceId: string): Promise<RepositoryResponse<StaffWithAssignment[]>>;

  getStaffById(staffId: string): Promise<RepositoryResponse<Staff>>;

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
  ): Promise<RepositoryResponse<StaffWithAssignment>>;

  updateStaff(staffId: string, updates: UpdateStaffInput): Promise<RepositoryResponse<Staff>>;

  removeStaffFromResidence(assignmentId: string): Promise<RepositoryResponse<null>>;

  updateAssignment(assignmentId: string, updates: UpdateAssignmentInput): Promise<RepositoryResponse<StaffAssignment>>;

  updateSchedules(assignmentId: string, schedules: Omit<CreateScheduleInput, 'staff_assignment_id'>[]): Promise<RepositoryResponse<StaffSchedule[]>>;

  toggleAccessTemporarily(staffId: string, isDisabled: boolean): Promise<RepositoryResponse<Staff>>;
}
