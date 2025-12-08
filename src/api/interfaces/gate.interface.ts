import type { SocietyGate, SocietyGateWithSociety } from '@/types';
import type { RepositoryResponse } from '../profile.interface';

export interface IGateRepository {
  findById(gateId: string): Promise<RepositoryResponse<SocietyGate>>;
  findBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyGate[]>>;
  findActiveBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyGate[]>>;
  create(gate: Omit<SocietyGate, 'id' | 'created_at'>): Promise<RepositoryResponse<SocietyGate>>;
  update(gateId: string, gate: Partial<Omit<SocietyGate, 'id' | 'created_at'>>): Promise<RepositoryResponse<SocietyGate>>;
  delete(gateId: string): Promise<RepositoryResponse<void>>;
}
