import type { SocietyShift, SocietyShiftWithSociety } from '@/types';
import type { RepositoryResponse } from './profile.interface';

export interface IShiftRepository {
  findById(shiftId: string): Promise<RepositoryResponse<SocietyShift>>;
  findBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyShift[]>>;
  findActiveBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyShift[]>>;
  create(shift: Omit<SocietyShift, 'id' | 'created_at'>): Promise<RepositoryResponse<SocietyShift>>;
  update(shiftId: string, shift: Partial<Omit<SocietyShift, 'id' | 'created_at'>>): Promise<RepositoryResponse<SocietyShift>>;
  delete(shiftId: string): Promise<RepositoryResponse<void>>;
}
