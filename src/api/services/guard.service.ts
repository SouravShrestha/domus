import type { SocietyGuard, SocietyGuardInvite } from '@/types';
import { guardRepository } from '@/api/repositories/guard/guard.repository';
import { guardInviteRepository } from '@/api/repositories/guard/guardInvite.repository';
import type { SocietyGuardWithDetails } from '@/api/interfaces/guard.interface';
import { formatPhoneForApi, formatPhoneForDisplay } from '@/utils/phoneHelpers';
import { logActivity } from './activity.service';
import { ActivityType } from '@/types/models/activity';
import { appEventEmitter, AppEvents } from '@/utils/eventEmitter';

type RepositoryResponse<T> = {
  data: T | null;
  error: Error | null;
};

export async function getGuardsBySocietyId(
  societyId: string
): Promise<RepositoryResponse<SocietyGuardWithDetails[]>> {
  try {
    const { data, error } = await guardRepository.findBySocietyId(societyId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getActiveGuardsBySocietyId(
  societyId: string
): Promise<RepositoryResponse<SocietyGuardWithDetails[]>> {
  try {
    const { data, error } =
      await guardRepository.findActiveBySocietyId(societyId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createGuardInvite(
  societyId: string,
  phone: string,
  name: string,
  addedByUserId: string
): Promise<RepositoryResponse<SocietyGuardInvite>> {
  try {
    const formattedPhone = formatPhoneForApi(phone);

    console.log(societyId, formattedPhone, name, addedByUserId);

    const existingInvite = await guardInviteRepository.findByPhone(
      formattedPhone
    );
    if (existingInvite.data) {
      return {
        data: null,
        error: new Error('A pending invite already exists for this phone number'),
      };
    }
    console.log('existingInvite', existingInvite);

    const { data, error } = await guardInviteRepository.create({
      society_id: societyId,
      phone: formattedPhone,
      name,
      added_by: addedByUserId,
    });

    console.log('data', data);
    console.log('error', error);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (data) {
      await logActivity(
        null,
        addedByUserId,
        ActivityType.GUARD_INVITED,
        `${name} (${formatPhoneForDisplay(phone)})`,
        {
          guard_name: name,
          guard_phone: formatPhoneForDisplay(phone),
        }
      );

      appEventEmitter.emit(AppEvents.ACTIVITIES_UPDATED);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getGuardInvitesBySocietyId(
  societyId: string
): Promise<RepositoryResponse<SocietyGuardInvite[]>> {
  try {
    const { data, error } =
      await guardInviteRepository.findBySocietyId(societyId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getPendingGuardInvitesBySocietyId(
  societyId: string
): Promise<RepositoryResponse<SocietyGuardInvite[]>> {
  try {
    const { data, error } =
      await guardInviteRepository.findPendingBySocietyId(societyId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function deleteGuardInvite(
  inviteId: string
): Promise<RepositoryResponse<void>> {
  try {
    const { error } = await guardInviteRepository.delete(inviteId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function updateGuardStatus(
  guardId: string,
  status: 'active' | 'inactive'
): Promise<RepositoryResponse<SocietyGuard>> {
  try {
    const { data, error } = await guardRepository.updateStatus(guardId, status);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function deleteGuard(
  guardId: string
): Promise<RepositoryResponse<void>> {
  try {
    const { error } = await guardRepository.delete(guardId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
