import { SocietyGate } from "@/types/models/societyGate";
import { ApiResponse } from "@/api/types/apiResponse";

export interface IGateRepository {
  findById(gateId: string): Promise<ApiResponse<SocietyGate>>;
  findBySocietyId(societyId: string): Promise<ApiResponse<SocietyGate[]>>;
  findActiveBySocietyId(societyId: string): Promise<ApiResponse<SocietyGate[]>>;
  create(gate: Omit<SocietyGate, "id" | "created_at">): Promise<ApiResponse<SocietyGate>>;
  update(gateId: string, gate: Partial<Omit<SocietyGate, "id" | "created_at">>): Promise<ApiResponse<SocietyGate>>;
  delete(gateId: string): Promise<ApiResponse<void>>;
}

export interface IGateService {
  getGateById(gateId: string): Promise<ApiResponse<SocietyGate>>;
  getGatesBySociety(societyId: string): Promise<ApiResponse<SocietyGate[]>>;
  getActiveGatesBySociety(societyId: string): Promise<ApiResponse<SocietyGate[]>>;
  createGate(societyId: string, name: string, createdBy: string): Promise<ApiResponse<SocietyGate>>;
  updateGate(gateId: string, updates: { name?: string; is_active?: boolean }): Promise<ApiResponse<SocietyGate>>;
  deleteGate(gateId: string): Promise<ApiResponse<void>>;
}
