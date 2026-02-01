import type { SocietyContact } from '@/types';
import type { RepositoryResponse } from './profile.interface';

export interface ISocietyContactRepository {
  findById(id: string): Promise<RepositoryResponse<SocietyContact>>;
  findBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyContact[]>>;
  findActiveBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyContact[]>>;
  create(contact: Omit<SocietyContact, 'id' | 'created_at' | 'updated_at'>): Promise<RepositoryResponse<SocietyContact>>;
  update(id: string, contact: Partial<Omit<SocietyContact, 'id' | 'created_at' | 'updated_at'>>): Promise<RepositoryResponse<SocietyContact>>;
  delete(id: string): Promise<RepositoryResponse<void>>;
}
