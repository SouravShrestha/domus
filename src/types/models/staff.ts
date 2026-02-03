export type StaffCategory = 
  | 'maid' 
  | 'cook' 
  | 'driver' 
  | 'nanny' 
  | 'support';

export type StaffGender = 'male' | 'female';

export type StaffAssignmentStatus = 'active' | 'inactive' | 'removed';

export type Staff = {
  id: string;
  name: string;
  phone: string;
  category: StaffCategory;
  gender: StaffGender;
  photo_url?: string | null;
  image_url?: string | null;
  vehicle_number?: string | null;
  residence_id: string;
  helper_code: string;
  is_access_disabled?: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type StaffAssignment = {
  id: string;
  staff_id: string;
  residence_id: string;
  assigned_by: string;
  status: StaffAssignmentStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type StaffSchedule = {
  id: string;
  staff_assignment_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StaffWithAssignment = Staff & {
  assignment: StaffAssignment;
  schedules: StaffSchedule[];
};

export type StaffWithDetails = Staff & {
  assignments: (StaffAssignment & {
    residence: {
      id: string;
      short_name: string;
      flat_number: string;
    };
    schedules: StaffSchedule[];
  })[];
};

export const STAFF_CATEGORIES: { value: StaffCategory; label: string }[] = [
  { value: 'maid', label: 'Maid' },
  { value: 'cook', label: 'Cook' },
  { value: 'driver', label: 'Driver' },
  { value: 'nanny', label: 'Nanny' },
  { value: 'support', label: 'Other' },
];

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
