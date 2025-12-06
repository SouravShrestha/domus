import { UserProfile } from "@models/user";
import { ensurePhoneHasPlusPrefix } from "@utils/phoneHelpers";
import { profileRepository } from "@repositories/profile/profile.repository";
import { DuplicateEmailError } from "../errors/profile.errors";
import {
  IProfileRepository,
  IProfileService,
  RepositoryResponse,
} from "@interfaces/profile.interface";

export class ProfileService implements IProfileService {
  constructor(private readonly repository: IProfileRepository) { }

  async fetchProfile(id: string): Promise<RepositoryResponse<UserProfile>> {
    const start = performance.now();
    const result = await this.repository.findById(id);
    const duration = performance.now() - start;
    console.log(`[Profile Service] fetchProfile took ${duration.toFixed(2)}ms`);
    return result;
  }

  async findByPhone(phone: string): Promise<RepositoryResponse<Pick<UserProfile, "id">>> {
    return this.repository.findByPhone(phone);
  }

  async createProfile(
    user: UserProfile
  ): Promise<RepositoryResponse<UserProfile>> {
    const normalizedUser = this.normalizeUserData(user);

    if (normalizedUser.email) {
      const emailTaken = await this.isEmailTaken(normalizedUser.email);
      if (emailTaken) {
        throw new DuplicateEmailError();
      }
    }

    return this.repository.create(normalizedUser);
  }

  private normalizeUserData(user: UserProfile): UserProfile {
    return {
      ...user,
      email: user.email?.trim().toLowerCase() || null,
      phone: ensurePhoneHasPlusPrefix(user.phone),
    };
  }

  private async isEmailTaken(email: string): Promise<boolean> {
    const { data, error } = await this.repository.findByEmail(email);

    if (error) {
      console.error("Error checking email existence:", error);
      return false;
    }

    return data !== null;
  }
}

const profileService = new ProfileService(profileRepository);

export const fetchProfile = (id: string) => profileService.fetchProfile(id);
export const createProfile = (user: UserProfile) =>
  profileService.createProfile(user);
export const findByPhone = (phone: string) =>
  profileService.findByPhone(phone);

export { profileService };
