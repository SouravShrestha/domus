import { AvatarsResponse, AvatarDto } from "@/types/api/response/avatar";

export interface IAvatarRepository {
  listByGender(gender: string): Promise<AvatarDto[]>;
}

export interface IAvatarService {
  getAvatarsByGender(gender: string): Promise<AvatarsResponse>;
  getAllAvatars(): Promise<AvatarsResponse>;
}
