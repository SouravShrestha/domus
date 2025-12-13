import { maintenanceRepository, MaintenanceRepository } from "@/api/repositories/maintenance/maintenance.repository";

export class MaintenanceService {
  constructor(private readonly repo: MaintenanceRepository) {}

  async getMaintenanceUpdates(societyId: string) {
    return this.repo.findBySocietyId(societyId);
  }
}

export const maintenanceService = new MaintenanceService(maintenanceRepository);

export const getMaintenanceUpdates = (societyId: string) =>
  maintenanceService.getMaintenanceUpdates(societyId);
