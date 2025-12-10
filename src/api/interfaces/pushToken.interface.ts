import { PushToken, PushTokenCreate } from "@models/pushToken";
import { RepositoryResponse } from "./profile.interface";

export interface IPushTokenRepository {
  findByUserId(userId: string): Promise<RepositoryResponse<PushToken[]>>;

  findByToken(token: string): Promise<RepositoryResponse<PushToken>>;

  upsert(data: PushTokenCreate): Promise<RepositoryResponse<PushToken>>;

  delete(userId: string, token: string): Promise<RepositoryResponse<null>>;

  deleteAllForUser(userId: string): Promise<RepositoryResponse<null>>;
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
