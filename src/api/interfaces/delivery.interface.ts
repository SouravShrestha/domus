import { DeliveryInvite, DeliveryInviteStatus, CreateDeliveryInviteParams, UpdateDeliveryInviteParams } from '@/types/models/delivery';
import { ApiResponse } from '@/api/types/apiResponse';

export interface IDeliveryInviteRepository {
  create(params: CreateDeliveryInviteParams): Promise<ApiResponse<DeliveryInvite>>;
  findByResidenceAndStatus(
    residenceId: string,
    statuses: DeliveryInviteStatus[]
  ): Promise<ApiResponse<DeliveryInvite[]>>;
  updateStatus(id: string, status: DeliveryInviteStatus, enteredAt?: string): Promise<ApiResponse<DeliveryInvite>>;
  update(id: string, params: UpdateDeliveryInviteParams): Promise<ApiResponse<DeliveryInvite>>;
  delete(id: string): Promise<ApiResponse<null>>;
}

export interface IDeliveryService {
  createDeliveryInvite(params: CreateDeliveryInviteParams): Promise<ApiResponse<DeliveryInvite>>;
  getUpcomingDeliveries(residenceId: string): Promise<ApiResponse<DeliveryInvite[]>>;
  getActiveDeliveries(residenceId: string): Promise<ApiResponse<DeliveryInvite[]>>;
  getDeliveryHistory(residenceId: string): Promise<ApiResponse<DeliveryInvite[]>>;
  markDelivered(id: string): Promise<ApiResponse<DeliveryInvite>>;
  updateDeliveryInvite(id: string, params: UpdateDeliveryInviteParams): Promise<ApiResponse<DeliveryInvite>>;
  deleteDeliveryInvite(id: string): Promise<ApiResponse<null>>;
}

