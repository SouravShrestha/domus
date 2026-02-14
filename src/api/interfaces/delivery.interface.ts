import { DeliveryInvite, DeliveryInviteStatus, CreateDeliveryInviteParams } from '@/types/models/delivery';
import { RepositoryResponse } from '@/api/interfaces/visitor.interface';

export interface IDeliveryInviteRepository {
  create(params: CreateDeliveryInviteParams): Promise<RepositoryResponse<DeliveryInvite>>;
  findByResidenceAndStatus(
    residenceId: string,
    statuses: DeliveryInviteStatus[]
  ): Promise<RepositoryResponse<DeliveryInvite[]>>;
  updateStatus(id: string, status: DeliveryInviteStatus, enteredAt?: string): Promise<RepositoryResponse<DeliveryInvite>>;
  delete(id: string): Promise<RepositoryResponse<null>>;
}

export interface IDeliveryService {
  createDeliveryInvite(params: CreateDeliveryInviteParams): Promise<RepositoryResponse<DeliveryInvite>>;
  getUpcomingDeliveries(residenceId: string): Promise<RepositoryResponse<DeliveryInvite[]>>;
  getActiveDeliveries(residenceId: string): Promise<RepositoryResponse<DeliveryInvite[]>>;
  getDeliveryHistory(residenceId: string): Promise<RepositoryResponse<DeliveryInvite[]>>;
  markDelivered(id: string): Promise<RepositoryResponse<DeliveryInvite>>;
  deleteDeliveryInvite(id: string): Promise<RepositoryResponse<null>>;
}
