import {
  GuestInvitation,
  GuestInvitationWithDetails,
  GuestLog,
  GuestLogWithInvitation,
  CreateGuestInvitationParams,
  UpdateGuestInvitationParams,
  GuestInvitationStatus,
  UnifiedGuestHistoryEntry,
} from '@/types/models/visitor';
import { ApiResponse } from '@/api/types/apiResponse';

export interface IGuestInvitationRepository {
  create(params: CreateGuestInvitationParams & { pass_code: string }): Promise<ApiResponse<GuestInvitation>>;
  
  findById(id: string): Promise<ApiResponse<GuestInvitation>>;
  
  findByIdWithDetails(id: string): Promise<ApiResponse<GuestInvitationWithDetails>>;
  
  findByPassCode(passCode: string): Promise<ApiResponse<GuestInvitationWithDetails>>;
  
  findByResidenceId(
    residenceId: string,
    status?: GuestInvitationStatus | null
  ): Promise<ApiResponse<GuestInvitationWithDetails[]>>;
  
  findByInvitedByUserId(
    userId: string,
    status?: GuestInvitationStatus | null
  ): Promise<ApiResponse<GuestInvitationWithDetails[]>>;
  
  findActiveByResidenceId(residenceId: string): Promise<ApiResponse<GuestInvitationWithDetails[]>>;
  
  updateStatus(id: string, status: GuestInvitationStatus): Promise<ApiResponse<GuestInvitation>>;
  
  incrementVisitsUsed(id: string): Promise<ApiResponse<GuestInvitation>>;
  
  update(id: string, params: UpdateGuestInvitationParams): Promise<ApiResponse<GuestInvitation>>;
  
  delete(id: string): Promise<ApiResponse<null>>;
  
  isPassCodeUnique(passCode: string): Promise<boolean>;
}

export interface IGuestLogRepository {
  create(params: {
    guest_invitation_id: string;
    residence_id: string;
    entry_method: string;
    entry_gate?: string;
  }): Promise<ApiResponse<GuestLog>>;
  
  findById(id: string): Promise<ApiResponse<GuestLog>>;
  
  findByInvitationId(invitationId: string): Promise<ApiResponse<GuestLog[]>>;
  
  findByResidenceId(
    residenceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<GuestLogWithInvitation[]>>;
  
  updateExit(
    id: string,
    exitMethod: string,
    exitGate?: string
  ): Promise<ApiResponse<GuestLog>>;
  
  findActiveGuests(residenceId: string): Promise<ApiResponse<GuestLogWithInvitation[]>>;

  findUnifiedHistory(
    residenceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<UnifiedGuestHistoryEntry[]>>;

  findBySocietyId(
    societyId: string,
    limit?: number
  ): Promise<ApiResponse<GuestLogWithInvitation[]>>;
}

export interface IGuestService {
  createInvitation(params: CreateGuestInvitationParams): Promise<ApiResponse<GuestInvitation>>;
  
  getInvitationById(id: string): Promise<ApiResponse<GuestInvitationWithDetails>>;
  
  getInvitationByPassCode(passCode: string): Promise<ApiResponse<GuestInvitationWithDetails>>;
  
  getResidenceInvitations(
    residenceId: string,
    status?: GuestInvitationStatus | null
  ): Promise<ApiResponse<GuestInvitationWithDetails[]>>;
  
  getMyInvitations(
    userId: string,
    status?: GuestInvitationStatus | null
  ): Promise<ApiResponse<GuestInvitationWithDetails[]>>;
  
  cancelInvitation(
    id: string,
    cancelledByUserId: string,
    residenceId: string,
    visitorName: string,
    visitorPhone: string,
    passCode?: string,
    purpose?: string,
    residenceShortName?: string
  ): Promise<ApiResponse<GuestInvitation>>;

  deleteInvitation(
    id: string,
    deletedByUserId: string,
    residenceId: string,
    visitorName: string,
    visitorPhone: string,
    passCode?: string,
    purpose?: string,
    residenceShortName?: string
  ): Promise<ApiResponse<null>>;
  
  recordEntry(
    passCode: string,
    entryMethod: string,
    entryGate?: string
  ): Promise<ApiResponse<GuestLog>>;
  
  recordExit(
    logId: string,
    exitMethod: string,
    exitGate?: string
  ): Promise<ApiResponse<GuestLog>>;
  
  getGuestHistory(
    residenceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<UnifiedGuestHistoryEntry[]>>;
  
  getActiveGuests(residenceId: string): Promise<ApiResponse<GuestLogWithInvitation[]>>;

  getUpcomingInvitations(residenceId: string): Promise<ApiResponse<GuestInvitationWithDetails[]>>;

  updateGuestInvitation(id: string, params: UpdateGuestInvitationParams): Promise<ApiResponse<GuestInvitation>>;
}
