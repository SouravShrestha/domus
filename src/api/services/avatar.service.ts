import { AvatarDto, AvatarsResponse } from "@/types/api/response/avatar";
import { IAvatarRepository, IAvatarService } from "@interfaces/avatar.interface";
import { avatarRepository } from "@repositories/avatar/avatar.repository";
import { apiLogger } from '@/api/utils/logger';

export class AvatarService implements IAvatarService {
  constructor(private readonly avatarRepo: IAvatarRepository) {}

  async getAvatarsByGender(gender: string): Promise<AvatarsResponse> {
    try {
      const avatars = await this.avatarRepo.listByGender(gender);
      return { avatars };
    } catch (error) {
      apiLogger.error("AvatarService", "Failed to get avatars by gender", error);
      return { avatars: [] };
    }
  }

  async getAllAvatars(): Promise<AvatarsResponse> {
    try {
      const genders = ["male", "female"];
      const allAvatars: AvatarDto[] = [];

      for (const gender of genders) {
        const avatars = await this.avatarRepo.listByGender(gender);
        allAvatars.push(...avatars);
      }

      return { avatars: allAvatars };
    } catch (error) {
      apiLogger.error("AvatarService", "Failed to get all avatars", error);
      return { avatars: [] };
    }
  }
}

export const avatarService = new AvatarService(avatarRepository);
