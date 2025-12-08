import type { SocietyGate } from '@/types';
import { gateRepository } from '@/api/repositories/gate/gate.repository';

type RepositoryResponse<T> = {
  data: T | null;
  error: Error | null;
};

export async function getGateById(
  gateId: string
): Promise<RepositoryResponse<SocietyGate>> {
  try {
    const { data, error } = await gateRepository.findById(gateId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getGatesBySocietyId(
  societyId: string
): Promise<RepositoryResponse<SocietyGate[]>> {
  try {
    const { data, error } = await gateRepository.findBySocietyId(societyId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getActiveGatesBySocietyId(
  societyId: string
): Promise<RepositoryResponse<SocietyGate[]>> {
  try {
    const { data, error } =
      await gateRepository.findActiveBySocietyId(societyId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createGate(
  gate: Omit<SocietyGate, 'id' | 'created_at'>
): Promise<RepositoryResponse<SocietyGate>> {
  try {
    const { data, error } = await gateRepository.create(gate);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function updateGate(
  gateId: string,
  gate: Partial<Omit<SocietyGate, 'id' | 'created_at'>>
): Promise<RepositoryResponse<SocietyGate>> {
  try {
    const { data, error } = await gateRepository.update(gateId, gate);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function deleteGate(
  gateId: string
): Promise<RepositoryResponse<void>> {
  try {
    const { error } = await gateRepository.delete(gateId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function toggleGateStatus(
  gateId: string,
  isActive: boolean
): Promise<RepositoryResponse<SocietyGate>> {
  return updateGate(gateId, { is_active: isActive });
}
