import {
  Staff,
  StaffAssignment,
  StaffSchedule,
  StaffCategory,
  StaffWithAssignment,
} from "@/types/models/staff";
import {
  IStaffRepository,
  IStaffService,
  RepositoryResponse,
  CreateScheduleInput,
  UpdateStaffInput,
  UpdateAssignmentInput,
} from "@interfaces/staff.interface";
import { staffRepository } from "@repositories/staff/staff.repository";

const MAX_CODE_GENERATION_ATTEMPTS = 10;

export class StaffService implements IStaffService {
  constructor(private readonly staffRepo: IStaffRepository) {}

  private generateHelperCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async generateUniqueHelperCode(): Promise<string> {
    for (let i = 0; i < MAX_CODE_GENERATION_ATTEMPTS; i++) {
      const code = this.generateHelperCode();
      const { data } = await this.staffRepo.findByHelperCode(code);
      if (!data) {
        return code;
      }
    }
    throw new Error("Failed to generate unique helper code");
  }

  async getStaffByResidence(residenceId: string): Promise<RepositoryResponse<StaffWithAssignment[]>> {
    return this.staffRepo.findByResidenceId(residenceId);
  }

  async getStaffById(staffId: string): Promise<RepositoryResponse<Staff>> {
    return this.staffRepo.findById(staffId);
  }

  async addStaff(
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
  ): Promise<RepositoryResponse<StaffWithAssignment>> {
    try {
      const existingStaff = await this.staffRepo.findByPhone(staffData.phone, residenceId);
      
      let staff: Staff;
      
      if (existingStaff.data) {
        staff = existingStaff.data;
        
        const existingAssignment = await this.staffRepo.findAssignmentByStaffAndResidence(
          staff.id, 
          residenceId
        );
        
        if (existingAssignment.data) {
          if (existingAssignment.data.status === 'removed') {
            const reactivated = await this.staffRepo.updateAssignment(
              existingAssignment.data.id,
              { status: 'active' }
            );
            
            if (reactivated.error) {
              return { data: null, error: reactivated.error };
            }

            if (schedules && schedules.length > 0) {
              await this.staffRepo.upsertSchedules(existingAssignment.data.id, schedules);
            }

            const result = await this.staffRepo.findByResidenceId(residenceId);
            const staffWithAssignment = result.data?.find(s => s.id === staff.id);
            
            return { data: staffWithAssignment || null, error: null };
          }
          
          return { 
            data: null, 
            error: new Error("Staff already assigned to this residence") 
          };
        }
      } else {
        const newStaff = await this.staffRepo.create({
          ...staffData,
          residence_id: residenceId,
          helper_code: await this.generateUniqueHelperCode(),
          created_by: userId,
        });

        if (newStaff.error || !newStaff.data) {
          return { data: null, error: newStaff.error || new Error("Failed to create staff") };
        }
        
        staff = newStaff.data;
      }

      const assignment = await this.staffRepo.createAssignment({
        staff_id: staff.id,
        residence_id: residenceId,
        assigned_by: userId,
      });

      if (assignment.error || !assignment.data) {
        return { data: null, error: assignment.error || new Error("Failed to create assignment") };
      }

      let createdSchedules: StaffSchedule[] = [];
      if (schedules && schedules.length > 0) {
        const schedulesResult = await this.staffRepo.upsertSchedules(
          assignment.data.id, 
          schedules
        );
        if (schedulesResult.data) {
          createdSchedules = schedulesResult.data;
        }
      }

      const result: StaffWithAssignment = {
        ...staff,
        assignment: assignment.data,
        schedules: createdSchedules,
      };

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateStaff(staffId: string, updates: UpdateStaffInput): Promise<RepositoryResponse<Staff>> {
    return this.staffRepo.update(staffId, updates);
  }

  async removeStaffFromResidence(assignmentId: string): Promise<RepositoryResponse<null>> {
    const result = await this.staffRepo.updateAssignment(assignmentId, { status: 'removed' });
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: null, error: null };
  }

  async updateAssignment(
    assignmentId: string, 
    updates: UpdateAssignmentInput
  ): Promise<RepositoryResponse<StaffAssignment>> {
    return this.staffRepo.updateAssignment(assignmentId, updates);
  }

  async updateSchedules(
    assignmentId: string, 
    schedules: Omit<CreateScheduleInput, 'staff_assignment_id'>[]
  ): Promise<RepositoryResponse<StaffSchedule[]>> {
    return this.staffRepo.upsertSchedules(assignmentId, schedules);
  }

  async toggleAccessTemporarily(
    staffId: string, 
    isDisabled: boolean
  ): Promise<RepositoryResponse<Staff>> {
    return this.staffRepo.update(staffId, { 
      is_access_disabled: isDisabled 
    });
  }
}

const staffService = new StaffService(staffRepository);

export const getStaffByResidence = (residenceId: string) =>
  staffService.getStaffByResidence(residenceId);

export const getStaffById = (staffId: string) =>
  staffService.getStaffById(staffId);

export const addStaff = (
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
) => staffService.addStaff(residenceId, userId, staffData, schedules);

export const updateStaff = (staffId: string, updates: UpdateStaffInput) =>
  staffService.updateStaff(staffId, updates);

export const removeStaffFromResidence = (assignmentId: string) =>
  staffService.removeStaffFromResidence(assignmentId);

export const updateAssignment = (assignmentId: string, updates: UpdateAssignmentInput) =>
  staffService.updateAssignment(assignmentId, updates);

export const updateSchedules = (
  assignmentId: string, 
  schedules: Omit<CreateScheduleInput, 'staff_assignment_id'>[]
) => staffService.updateSchedules(assignmentId, schedules);

export const toggleAccessTemporarily = (staffId: string, isDisabled: boolean) =>
  staffService.toggleAccessTemporarily(staffId, isDisabled);

export { staffService };
