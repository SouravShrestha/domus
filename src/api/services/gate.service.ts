import { gateRepository } from "@/api/repositories/gate/gate.repository";
import { IGateRepository, IGateService } from "@/api/interfaces/gate.interface";
import { ApiResponse } from "@/api/types/apiResponse";
import { SocietyGate } from "@/types/models/societyGate";

export class GateService implements IGateService {
  constructor(private readonly repository: IGateRepository) {}

  async getGateById(gateId: string): Promise<ApiResponse<SocietyGate>> {
    return this.repository.findById(gateId);
  }

  async getGatesBySociety(societyId: string): Promise<ApiResponse<SocietyGate[]>> {
    return this.repository.findBySocietyId(societyId);
  }

  async getActiveGatesBySociety(societyId: string): Promise<ApiResponse<SocietyGate[]>> {
    return this.repository.findActiveBySocietyId(societyId);
  }

  async createGate(
    societyId: string,
    name: string,
    createdBy: string
  ): Promise<ApiResponse<SocietyGate>> {
    return this.repository.create({
      society_id: societyId,
      name,
      is_active: true,
      created_by: createdBy,
    });
  }

  async updateGate(
    gateId: string,
    updates: { name?: string; is_active?: boolean }
  ): Promise<ApiResponse<SocietyGate>> {
    return this.repository.update(gateId, updates);
  }

  async deleteGate(gateId: string): Promise<ApiResponse<void>> {
    return this.repository.delete(gateId);
  }
}

const gateService = new GateService(gateRepository);

const getGateById = (gateId: string) => gateService.getGateById(gateId);
const getGatesBySociety = (societyId: string) => gateService.getGatesBySociety(societyId);
const getActiveGatesBySociety = (societyId: string) => gateService.getActiveGatesBySociety(societyId);
const createGate = (societyId: string, name: string, createdBy: string) =>
  gateService.createGate(societyId, name, createdBy);
const updateGate = (gateId: string, updates: { name?: string; is_active?: boolean }) =>
  gateService.updateGate(gateId, updates);
const deleteGate = (gateId: string) => gateService.deleteGate(gateId);

export {
  gateService,
  getGateById,
  getGatesBySociety,
  getActiveGatesBySociety,
  createGate,
  updateGate,
  deleteGate,
};
