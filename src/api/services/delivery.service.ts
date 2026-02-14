import { IDeliveryService, IDeliveryInviteRepository } from '@/api/interfaces/delivery.interface';
import { RepositoryResponse } from '@/api/interfaces/visitor.interface';
import { DeliveryInvite, CreateDeliveryInviteParams } from '@/types/models/delivery';
import { deliveryInviteRepository } from '@/api/repositories/delivery/deliveryInvite.repository';

export class DeliveryService implements IDeliveryService {
  constructor(private readonly deliveryInviteRepo: IDeliveryInviteRepository) {}

  async createDeliveryInvite(
    params: CreateDeliveryInviteParams
  ): Promise<RepositoryResponse<DeliveryInvite>> {
    return this.deliveryInviteRepo.create(params);
  }

  async getUpcomingDeliveries(
    residenceId: string
  ): Promise<RepositoryResponse<DeliveryInvite[]>> {
    return this.deliveryInviteRepo.findByResidenceAndStatus(residenceId, ['scheduled']);
  }

  async getActiveDeliveries(
    residenceId: string
  ): Promise<RepositoryResponse<DeliveryInvite[]>> {
    return this.deliveryInviteRepo.findByResidenceAndStatus(residenceId, ['active']);
  }

  async getDeliveryHistory(
    residenceId: string
  ): Promise<RepositoryResponse<DeliveryInvite[]>> {
    return this.deliveryInviteRepo.findByResidenceAndStatus(residenceId, ['delivered', 'expired']);
  }

  async markDelivered(id: string): Promise<RepositoryResponse<DeliveryInvite>> {
    return this.deliveryInviteRepo.updateStatus(id, 'delivered', new Date().toISOString());
  }

  async deleteDeliveryInvite(id: string): Promise<RepositoryResponse<null>> {
    return this.deliveryInviteRepo.delete(id);
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

export { deliveryService };
