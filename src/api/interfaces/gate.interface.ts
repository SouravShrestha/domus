import { SocietyGate } from "@/types/models/societyGate";

export type RepositoryResponse<T> = {
  data: T | null;
  error: Error | null;
};

export interface IGateRepository {
  findById(gateId: string): Promise<RepositoryResponse<SocietyGate>>;
  findBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyGate[]>>;
  findActiveBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyGate[]>>;
  create(gate: Omit<SocietyGate, "id" | "created_at">): Promise<RepositoryResponse<SocietyGate>>;
  update(gateId: string, gate: Partial<Omit<SocietyGate, "id" | "created_at">>): Promise<RepositoryResponse<SocietyGate>>;
  delete(gateId: string): Promise<RepositoryResponse<void>>;
}

export interface IGateService {
  getGateById(gateId: string): Promise<RepositoryResponse<SocietyGate>>;
  getGatesBySociety(societyId: string): Promise<RepositoryResponse<SocietyGate[]>>;
  getActiveGatesBySociety(societyId: string): Promise<RepositoryResponse<SocietyGate[]>>;
  createGate(societyId: string, name: string, createdBy: string): Promise<RepositoryResponse<SocietyGate>>;
  updateGate(gateId: string, updates: { name?: string; is_active?: boolean }): Promise<RepositoryResponse<SocietyGate>>;
  deleteGate(gateId: string): Promise<RepositoryResponse<void>>;
}
