import type { SocietyGate } from './gate';
import type { SocietyShift } from './shift';
import type { SocietyGuard } from './guard';
import type { User } from './user';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type GuardGateAssignment = {
  id: string;
  guard_id: string;
  gate_id: string;
  shift_id: string;
  days_of_week: DayOfWeek[];
  effective_from: string;
  effective_until?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GuardGateAssignmentWithDetails = GuardGateAssignment & {
  guard: SocietyGuard & {
    user: Pick<User, 'id' | 'name' | 'phone' | 'photo_url'>;
  };
  gate: SocietyGate;
  shift: SocietyShift;
};

export type GuardGateAssignmentCreateInput = {
  guard_id: string;
  gate_id: string;
  shift_id: string;
  days_of_week: DayOfWeek[];
  effective_from?: string;
  effective_until?: string | null;
};

export type GuardGateAssignmentUpdateInput = {
  gate_id?: string;
  shift_id?: string;
  days_of_week?: DayOfWeek[];
  effective_from?: string;
  effective_until?: string | null;
  is_active?: boolean;
};
