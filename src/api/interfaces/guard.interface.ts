import type { SocietyGuard, SocietyGuardInvite, SocietyGuardWithSociety } from '@/types';
import type { RepositoryResponse } from '../profile.interface';

export interface IGuardRepository {
  findById(guardId: string): Promise<RepositoryResponse<SocietyGuard>>;
  findBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyGuardWithDetails[]>>;
  findActiveBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyGuardWithDetails[]>>;
  findByUserId(userId: string): Promise<RepositoryResponse<SocietyGuardWithSociety[]>>;
  updateStatus(guardId: string, status: 'active' | 'inactive'): Promise<RepositoryResponse<SocietyGuard>>;
  delete(guardId: string): Promise<RepositoryResponse<void>>;
}

export interface IGuardInviteRepository {
  create(invite: Omit<SocietyGuardInvite, 'id' | 'created_at' | 'status'>): Promise<RepositoryResponse<SocietyGuardInvite>>;
  findById(inviteId: string): Promise<RepositoryResponse<SocietyGuardInvite>>;
  findBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyGuardInvite[]>>;
  findPendingBySocietyId(societyId: string): Promise<RepositoryResponse<SocietyGuardInvite[]>>;
  findByPhone(phone: string): Promise<RepositoryResponse<SocietyGuardInvite>>;
  delete(inviteId: string): Promise<RepositoryResponse<void>>;
}

export type SocietyGuardWithDetails = SocietyGuard & {
  user: {
    id: string;
    name: string;
    phone: string;
    photo_url?: string | null;
  };
};
