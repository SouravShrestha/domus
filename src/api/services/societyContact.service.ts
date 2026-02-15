import type { SocietyContact } from '@/types';
import { societyContactRepository } from '@/api/repositories/societyContact/societyContact.repository';

type ApiResponse<T> = {
  data: T | null;
  error: Error | null;
};

export async function getSocietyContactById(
  id: string
): Promise<ApiResponse<SocietyContact>> {
  try {
    const { data, error } = await societyContactRepository.findById(id);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getSocietyContactsBySocietyId(
  societyId: string
): Promise<ApiResponse<SocietyContact[]>> {
  try {
    const { data, error } = await societyContactRepository.findBySocietyId(societyId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getActiveSocietyContactsBySocietyId(
  societyId: string
): Promise<ApiResponse<SocietyContact[]>> {
  try {
    const { data, error } = await societyContactRepository.findActiveBySocietyId(societyId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createSocietyContact(
  contact: Omit<SocietyContact, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<SocietyContact>> {
  try {
    const { data, error } = await societyContactRepository.create(contact);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function updateSocietyContact(
  id: string,
  contact: Partial<Omit<SocietyContact, 'id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<SocietyContact>> {
  try {
    const { data, error } = await societyContactRepository.update(id, contact);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function deleteSocietyContact(
  id: string
): Promise<ApiResponse<void>> {
  try {
    const { error } = await societyContactRepository.delete(id);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function toggleSocietyContactStatus(
  id: string,
  isActive: boolean
): Promise<ApiResponse<SocietyContact>> {
  return updateSocietyContact(id, { is_active: isActive });
}
