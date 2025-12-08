import type { SocietyShift } from '@/types';
import { shiftRepository } from '@/api/repositories/shift/shift.repository';

type RepositoryResponse<T> = {
  data: T | null;
  error: Error | null;
};

export async function getShiftById(
  shiftId: string
): Promise<RepositoryResponse<SocietyShift>> {
  try {
    const { data, error } = await shiftRepository.findById(shiftId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getShiftsBySocietyId(
  societyId: string
): Promise<RepositoryResponse<SocietyShift[]>> {
  try {
    const { data, error } = await shiftRepository.findBySocietyId(societyId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getActiveShiftsBySocietyId(
  societyId: string
): Promise<RepositoryResponse<SocietyShift[]>> {
  try {
    const { data, error } =
      await shiftRepository.findActiveBySocietyId(societyId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createShift(
  shift: Omit<SocietyShift, 'id' | 'created_at'>
): Promise<RepositoryResponse<SocietyShift>> {
  try {
    const { data, error } = await shiftRepository.create(shift);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function updateShift(
  shiftId: string,
  shift: Partial<Omit<SocietyShift, 'id' | 'created_at'>>
): Promise<RepositoryResponse<SocietyShift>> {
  try {
    const { data, error } = await shiftRepository.update(shiftId, shift);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function deleteShift(
  shiftId: string
): Promise<RepositoryResponse<void>> {
  try {
    const { error } = await shiftRepository.delete(shiftId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function toggleShiftStatus(
  shiftId: string,
  isActive: boolean
): Promise<RepositoryResponse<SocietyShift>> {
  return updateShift(shiftId, { is_active: isActive });
}
