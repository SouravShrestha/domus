import { PushToken, PushTokenCreate } from "@models/pushToken";
import { ApiResponse } from "@/api/types/apiResponse";

export interface IPushTokenRepository {
  findByUserId(userId: string): Promise<ApiResponse<PushToken[]>>;

  findByToken(token: string): Promise<ApiResponse<PushToken>>;

  upsert(data: PushTokenCreate): Promise<ApiResponse<PushToken>>;

  delete(userId: string, token: string): Promise<ApiResponse<null>>;

  deleteAllForUser(userId: string): Promise<ApiResponse<null>>;
}

export interface IPushTokenService {
  registerPushToken(
    token: string,
    deviceId?: string
  ): Promise<PushToken | null>;

  unregisterPushToken(token: string): Promise<boolean>;

  unregisterAllTokens(): Promise<boolean>;

  getTokensForCurrentUser(): Promise<PushToken[]>;
}
