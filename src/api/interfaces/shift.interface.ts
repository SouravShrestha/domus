import type { SocietyShift, SocietyShiftWithSociety } from '@/types';
import type { ApiResponse } from "@/api/types/apiResponse";

export interface IShiftRepository {
  findById(shiftId: string): Promise<ApiResponse<SocietyShift>>;
  findBySocietyId(societyId: string): Promise<ApiResponse<SocietyShift[]>>;
  findActiveBySocietyId(societyId: string): Promise<ApiResponse<SocietyShift[]>>;
  create(shift: Omit<SocietyShift, 'id' | 'created_at'>): Promise<ApiResponse<SocietyShift>>;
  update(shiftId: string, shift: Partial<Omit<SocietyShift, 'id' | 'created_at'>>): Promise<ApiResponse<SocietyShift>>;
  delete(shiftId: string): Promise<ApiResponse<void>>;
}
