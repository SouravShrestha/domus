import { AvatarsResponse } from "@/types/api/response/avatar";

export interface IAvatarService {
  getAvatarsByGender(gender: string): Promise<AvatarsResponse>;
  getAllAvatars(): Promise<AvatarsResponse>;
}
