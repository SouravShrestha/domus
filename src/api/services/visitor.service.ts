import {
  IGuestService,
  IGuestInvitationRepository,
  IGuestLogRepository,
  RepositoryResponse,
} from '@/api/interfaces/visitor.interface';
import {
  GuestInvitation,
  GuestInvitationWithDetails,
  GuestLog,
  GuestLogWithInvitation,
  GuestInvitationStatus,
  CreateGuestInvitationParams,
} from '@/types/models/visitor';
import { guestInvitationRepository } from '@/api/repositories/visitor/visitorInvitation.repository';
import { guestLogRepository } from '@/api/repositories/visitor/visitorLog.repository';
import { formatPhoneForApi, formatPhoneForDisplay } from '@/utils/phoneHelpers';
import { logActivity } from './activity.service';
import { ActivityType } from '@/types/models/activity';
import { appEventEmitter, AppEvents } from '@/utils/eventEmitter';

const MAX_CODE_GENERATION_ATTEMPTS = 10;

export class GuestService implements IGuestService {
  constructor(
    private readonly invitationRepo: IGuestInvitationRepository,
    private readonly logRepo: IGuestLogRepository
  ) {}

  async createInvitation(
    params: CreateGuestInvitationParams
  ): Promise<RepositoryResponse<GuestInvitation>> {
    const passCode = await this.generateUniquePassCode();

    const result = await this.invitationRepo.create({
      ...params,
      visitor_phone: formatPhoneForApi(params.visitor_phone),
      pass_code: passCode,
    });

    if (result.data) {
      const visitorIdentifier = `${params.visitor_name} (${formatPhoneForDisplay(params.visitor_phone)})`;
      
      const residenceResponse = await this.invitationRepo.findByIdWithDetails(result.data.id);
      const residenceShortName = residenceResponse.data?.residence?.short_name || 'your residence';
      
      await logActivity(
        params.residence_id,
        params.invited_by_user_id,
        ActivityType.GUEST_INVITED,
        visitorIdentifier,
        {
          visitor_name: params.visitor_name,
          visitor_phone: formatPhoneForDisplay(params.visitor_phone),
          pass_code: passCode,
          valid_from: params.valid_from,
          valid_until: params.valid_until,
          purpose: params.purpose,
          residenceShortName,
        }
      );

      appEventEmitter.emit(AppEvents.GUEST_INVITATION_CREATED);
      appEventEmitter.emit(AppEvents.ACTIVITIES_UPDATED);
    }

    return result;
  }

  async getInvitationById(id: string): Promise<RepositoryResponse<GuestInvitationWithDetails>> {
    return this.invitationRepo.findByIdWithDetails(id);
  }

  async getInvitationByPassCode(
    passCode: string
  ): Promise<RepositoryResponse<GuestInvitationWithDetails>> {
    return this.invitationRepo.findByPassCode(passCode.toUpperCase());
  }

  async getResidenceInvitations(
    residenceId: string,
    status?: GuestInvitationStatus | null
  ): Promise<RepositoryResponse<GuestInvitationWithDetails[]>> {
    return this.invitationRepo.findByResidenceId(residenceId, status);
  }

  async getMyInvitations(
    userId: string,
    status?: GuestInvitationStatus | null
  ): Promise<RepositoryResponse<GuestInvitationWithDetails[]>> {
    return this.invitationRepo.findByInvitedByUserId(userId, status);
  }

  async getActiveInvitations(
    residenceId: string
  ): Promise<RepositoryResponse<GuestInvitationWithDetails[]>> {
    return this.invitationRepo.findActiveByResidenceId(residenceId);
  }

  async cancelInvitation(
    id: string,
    cancelledByUserId: string,
    residenceId: string,
    visitorName: string,
    visitorPhone: string,
    passCode?: string,
    purpose?: string,
    residenceShortName?: string
  ): Promise<RepositoryResponse<GuestInvitation>> {
    const result = await this.invitationRepo.updateStatus(id, 'cancelled');

    if (result.data) {
      const visitorIdentifier = `${visitorName} (${formatPhoneForDisplay(visitorPhone)})`;

      await logActivity(
        residenceId,
        cancelledByUserId,
        ActivityType.GUEST_INVITATION_CANCELLED,
        visitorIdentifier,
        {
          visitor_name: visitorName,
          visitor_phone: formatPhoneForDisplay(visitorPhone),
          pass_code: passCode,
          purpose,
          residenceShortName,
        }
      );

      appEventEmitter.emit(AppEvents.GUEST_INVITATION_CREATED);
      appEventEmitter.emit(AppEvents.ACTIVITIES_UPDATED);
    }

    return result;
  }

  async deleteInvitation(
    id: string,
    deletedByUserId: string,
    residenceId: string,
    visitorName: string,
    visitorPhone: string,
    passCode?: string,
    purpose?: string,
    residenceShortName?: string
  ): Promise<RepositoryResponse<null>> {
    const result = await this.invitationRepo.delete(id);

    if (!result.error) {
      const visitorIdentifier = `${visitorName} (${formatPhoneForDisplay(visitorPhone)})`;

      await logActivity(
        residenceId,
        deletedByUserId,
        ActivityType.GUEST_INVITATION_DELETED,
        visitorIdentifier,
        {
          visitor_name: visitorName,
          visitor_phone: formatPhoneForDisplay(visitorPhone),
          pass_code: passCode,
          purpose,
          residenceShortName,
        }
      );

      appEventEmitter.emit(AppEvents.GUEST_INVITATION_CREATED);
      appEventEmitter.emit(AppEvents.ACTIVITIES_UPDATED);
    }

    return result;
  }

  async recordEntry(
    passCode: string,
    entryMethod: string,
    entryGate?: string
  ): Promise<RepositoryResponse<GuestLog>> {
    const { data: invitation, error: inviteError } = 
      await this.invitationRepo.findByPassCode(passCode.toUpperCase());

    if (inviteError || !invitation) {
      return { data: null, error: new Error('Invalid pass code') };
    }

    if (invitation.status !== 'active') {
      return { data: null, error: new Error('This pass is no longer active') };
    }

    const now = new Date();
    const validFrom = new Date(invitation.valid_from);
    const validUntil = new Date(invitation.valid_until);

    if (now < validFrom) {
      return { data: null, error: new Error('This pass is not yet valid') };
    }

    if (now > validUntil) {
      await this.invitationRepo.updateStatus(invitation.id, 'expired');
      return { data: null, error: new Error('This pass has expired') };
    }

    if (invitation.visits_used >= invitation.visits_allowed) {
      return { data: null, error: new Error('Maximum visits exceeded') };
    }

    const logResult = await this.logRepo.create({
      guest_invitation_id: invitation.id,
      residence_id: invitation.residence_id,
      entry_method: entryMethod,
      entry_gate: entryGate,
    });

    if (logResult.data) {
      await this.invitationRepo.incrementVisitsUsed(invitation.id);
    }

    return logResult;
  }

  async recordExit(
    logId: string,
    exitMethod: string,
    exitGate?: string
  ): Promise<RepositoryResponse<GuestLog>> {
    return this.logRepo.updateExit(logId, exitMethod, exitGate);
  }

  async getGuestHistory(
    residenceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<RepositoryResponse<GuestLogWithInvitation[]>> {
    return this.logRepo.findByResidenceId(residenceId, startDate, endDate);
  }

  async getActiveGuests(
    residenceId: string
  ): Promise<RepositoryResponse<GuestLogWithInvitation[]>> {
    return this.logRepo.findActiveGuests(residenceId);
  }

  private async generateUniquePassCode(): Promise<string> {
    for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
      const code = this.generatePassCode();
      const isUnique = await this.invitationRepo.isPassCodeUnique(code);

      if (isUnique) {
        return code;
      }
    }

    throw new Error('Failed to generate unique pass code');
  }

  private generatePassCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
}

const guestService = new GuestService(
  guestInvitationRepository,
  guestLogRepository
);

export const createGuestInvitation = (params: CreateGuestInvitationParams) =>
  guestService.createInvitation(params);

export const getGuestInvitationById = (id: string) =>
  guestService.getInvitationById(id);

export const getGuestInvitationByPassCode = (passCode: string) =>
  guestService.getInvitationByPassCode(passCode);

export const getResidenceGuestInvitations = (
  residenceId: string,
  status?: GuestInvitationStatus | null
) => guestService.getResidenceInvitations(residenceId, status);

export const getMyGuestInvitations = (
  userId: string,
  status?: GuestInvitationStatus | null
) => guestService.getMyInvitations(userId, status);

export const getActiveGuestInvitations = (residenceId: string) =>
  guestService.getActiveInvitations(residenceId);

export const cancelGuestInvitation = (
  id: string,
  cancelledByUserId: string,
  residenceId: string,
  visitorName: string,
  visitorPhone: string,
  passCode?: string,
  purpose?: string,
  residenceShortName?: string
) =>
  guestService.cancelInvitation(
    id,
    cancelledByUserId,
    residenceId,
    visitorName,
    visitorPhone,
    passCode,
    purpose,
    residenceShortName
  );

export const deleteGuestInvitation = (
  id: string,
  deletedByUserId: string,
  residenceId: string,
  visitorName: string,
  visitorPhone: string,
  passCode?: string,
  purpose?: string,
  residenceShortName?: string
) =>
  guestService.deleteInvitation(
    id,
    deletedByUserId,
    residenceId,
    visitorName,
    visitorPhone,
    passCode,
    purpose,
    residenceShortName
  );

export const recordGuestEntry = (
  passCode: string,
  entryMethod: string,
  entryGate?: string
) => guestService.recordEntry(passCode, entryMethod, entryGate);

export const recordGuestExit = (
  logId: string,
  exitMethod: string,
  exitGate?: string
) => guestService.recordExit(logId, exitMethod, exitGate);

export const getGuestHistory = (
  residenceId: string,
  startDate?: string,
  endDate?: string
) => guestService.getGuestHistory(residenceId, startDate, endDate);

export const getActiveGuests = (residenceId: string) =>
  guestService.getActiveGuests(residenceId);

export { guestService };
