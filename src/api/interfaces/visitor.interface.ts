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

export type RepositoryResponse<T> = {
  data: T | null;
  error: Error | null;
};

export interface IGuestInvitationRepository {
  create(params: CreateGuestInvitationParams & { pass_code: string }): Promise<RepositoryResponse<GuestInvitation>>;
  
  findById(id: string): Promise<RepositoryResponse<GuestInvitation>>;
  
  findByIdWithDetails(id: string): Promise<RepositoryResponse<GuestInvitationWithDetails>>;
  
  findByPassCode(passCode: string): Promise<RepositoryResponse<GuestInvitationWithDetails>>;
  
  findByResidenceId(
    residenceId: string,
    status?: GuestInvitationStatus | null
  ): Promise<RepositoryResponse<GuestInvitationWithDetails[]>>;
  
  findByInvitedByUserId(
    userId: string,
    status?: GuestInvitationStatus | null
  ): Promise<RepositoryResponse<GuestInvitationWithDetails[]>>;
  
  findActiveByResidenceId(residenceId: string): Promise<RepositoryResponse<GuestInvitationWithDetails[]>>;
  
  updateStatus(id: string, status: GuestInvitationStatus): Promise<RepositoryResponse<GuestInvitation>>;
  
  incrementVisitsUsed(id: string): Promise<RepositoryResponse<GuestInvitation>>;
  
  update(id: string, params: UpdateGuestInvitationParams): Promise<RepositoryResponse<GuestInvitation>>;
  
  delete(id: string): Promise<RepositoryResponse<null>>;
  
  isPassCodeUnique(passCode: string): Promise<boolean>;
}

export interface IGuestLogRepository {
  create(params: {
    guest_invitation_id: string;
    residence_id: string;
    entry_method: string;
    entry_gate?: string;
  }): Promise<RepositoryResponse<GuestLog>>;
  
  findById(id: string): Promise<RepositoryResponse<GuestLog>>;
  
  findByInvitationId(invitationId: string): Promise<RepositoryResponse<GuestLog[]>>;
  
  findByResidenceId(
    residenceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RepositoryResponse<GuestLogWithInvitation[]>>;
  
  updateExit(
    id: string,
    exitMethod: string,
    exitGate?: string
  ): Promise<RepositoryResponse<GuestLog>>;
  
  findActiveGuests(residenceId: string): Promise<RepositoryResponse<GuestLogWithInvitation[]>>;

  findUnifiedHistory(
    residenceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RepositoryResponse<UnifiedGuestHistoryEntry[]>>;

  findBySocietyId(
    societyId: string,
    limit?: number
  ): Promise<RepositoryResponse<GuestLogWithInvitation[]>>;
}

export interface IGuestService {
  createInvitation(params: CreateGuestInvitationParams): Promise<RepositoryResponse<GuestInvitation>>;
  
  getInvitationById(id: string): Promise<RepositoryResponse<GuestInvitationWithDetails>>;
  
  getInvitationByPassCode(passCode: string): Promise<RepositoryResponse<GuestInvitationWithDetails>>;
  
  getResidenceInvitations(
    residenceId: string,
    status?: GuestInvitationStatus | null
  ): Promise<RepositoryResponse<GuestInvitationWithDetails[]>>;
  
  getMyInvitations(
    userId: string,
    status?: GuestInvitationStatus | null
  ): Promise<RepositoryResponse<GuestInvitationWithDetails[]>>;
  
  cancelInvitation(
    id: string,
    cancelledByUserId: string,
    residenceId: string,
    visitorName: string,
    visitorPhone: string,
    passCode?: string,
    purpose?: string,
    residenceShortName?: string
  ): Promise<RepositoryResponse<GuestInvitation>>;

  deleteInvitation(
    id: string,
    deletedByUserId: string,
    residenceId: string,
    visitorName: string,
    visitorPhone: string,
    passCode?: string,
    purpose?: string,
    residenceShortName?: string
  ): Promise<RepositoryResponse<null>>;
  
  recordEntry(
    passCode: string,
    entryMethod: string,
    entryGate?: string
  ): Promise<RepositoryResponse<GuestLog>>;
  
  recordExit(
    logId: string,
    exitMethod: string,
    exitGate?: string
  ): Promise<RepositoryResponse<GuestLog>>;
  
  getGuestHistory(
    residenceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RepositoryResponse<UnifiedGuestHistoryEntry[]>>;
  
  getActiveGuests(residenceId: string): Promise<RepositoryResponse<GuestLogWithInvitation[]>>;

  getUpcomingInvitations(residenceId: string): Promise<RepositoryResponse<GuestInvitationWithDetails[]>>;

  updateGuestInvitation(id: string, params: UpdateGuestInvitationParams): Promise<RepositoryResponse<GuestInvitation>>;
}
