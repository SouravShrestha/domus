import { IDeliveryService, IDeliveryInviteRepository } from '@/api/interfaces/delivery.interface';
import { ApiResponse } from '@/api/types/apiResponse';
import { DeliveryInvite, CreateDeliveryInviteParams, UpdateDeliveryInviteParams } from '@/types/models/delivery';
import { deliveryInviteRepository } from '@/api/repositories/delivery/deliveryInvite.repository';

export class DeliveryService implements IDeliveryService {
  constructor(private readonly deliveryInviteRepo: IDeliveryInviteRepository) {}

  async createDeliveryInvite(
    params: CreateDeliveryInviteParams
  ): Promise<ApiResponse<DeliveryInvite>> {
    return this.deliveryInviteRepo.create(params);
  }

  async getUpcomingDeliveries(
    residenceId: string
  ): Promise<ApiResponse<DeliveryInvite[]>> {
    return this.deliveryInviteRepo.findByResidenceAndStatus(residenceId, ['scheduled']);
  }

  async getActiveDeliveries(
    residenceId: string
  ): Promise<ApiResponse<DeliveryInvite[]>> {
    return this.deliveryInviteRepo.findByResidenceAndStatus(residenceId, ['active']);
  }

  async getDeliveryHistory(
    residenceId: string
  ): Promise<ApiResponse<DeliveryInvite[]>> {
    return this.deliveryInviteRepo.findByResidenceAndStatus(residenceId, ['delivered', 'expired']);
  }

  async markDelivered(id: string): Promise<ApiResponse<DeliveryInvite>> {
    return this.deliveryInviteRepo.updateStatus(id, 'delivered', new Date().toISOString());
  }

  async deleteDeliveryInvite(id: string): Promise<ApiResponse<null>> {
    return this.deliveryInviteRepo.delete(id);
  }

  async updateDeliveryInvite(id: string, params: UpdateDeliveryInviteParams): Promise<ApiResponse<DeliveryInvite>> {
    return this.deliveryInviteRepo.update(id, params);
  }
}

const deliveryService = new DeliveryService(deliveryInviteRepository);

export const createDeliveryInvite = (params: CreateDeliveryInviteParams) =>
  deliveryService.createDeliveryInvite(params);

export const getUpcomingDeliveries = (residenceId: string) =>
  deliveryService.getUpcomingDeliveries(residenceId);

export const getActiveDeliveries = (residenceId: string) =>
  deliveryService.getActiveDeliveries(residenceId);

export const getDeliveryHistory = (residenceId: string) =>
  deliveryService.getDeliveryHistory(residenceId);

export const markDelivered = (id: string) =>
  deliveryService.markDelivered(id);

export const deleteDeliveryInvite = (id: string) =>
  deliveryService.deleteDeliveryInvite(id);

export const updateDeliveryInvite = (id: string, params: UpdateDeliveryInviteParams) =>
  deliveryService.updateDeliveryInvite(id, params);

export { deliveryService };
