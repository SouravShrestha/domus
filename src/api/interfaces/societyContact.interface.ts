import type { SocietyContact } from '@/types';
import type { ApiResponse } from "@/api/types/apiResponse";

export interface ISocietyContactRepository {
  findById(id: string): Promise<ApiResponse<SocietyContact>>;
  findBySocietyId(societyId: string): Promise<ApiResponse<SocietyContact[]>>;
  findActiveBySocietyId(societyId: string): Promise<ApiResponse<SocietyContact[]>>;
  create(contact: Omit<SocietyContact, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<SocietyContact>>;
  update(id: string, contact: Partial<Omit<SocietyContact, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<SocietyContact>>;
  delete(id: string): Promise<ApiResponse<void>>;
}
