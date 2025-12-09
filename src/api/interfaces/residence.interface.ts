import { PendingResidenceMembership } from "@models/residenceMembership";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import { RepositoryResponse } from "./profile.interface";
import { MemberPermissions } from "@/types/models/memberPermissions";

export type ResidenceMemberWithProfile = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    phone: string;
    photo_url: string | null;
  };
  permissions?: MemberPermissions;
};

export type PendingInviteWithDetails = {
  id: string;
  user_phone_number: string;
  role: string;
  status: string;
  invite_code: string;
  invitee_name: string | null;
  created_at: string;
  updated_at: string;
};

export type ResidenceMembersResponse = {
  approved: ResidenceMemberWithProfile[];
  pending: PendingInviteWithDetails[];
};

export type ResidenceWithMembers = {
  residence: ResidenceWithSociety;
  hasOwner: boolean;
  members: ResidenceMemberWithProfile[];
};

export interface IResidenceRepository {
  findByIdWithSociety(
    residenceId: string
  ): Promise<RepositoryResponse<ResidenceWithSociety>>;

  findMembersByResidenceId(
    residenceId: string
  ): Promise<RepositoryResponse<ResidenceMembersResponse>>;

  findAllBySocietyId(
    societyId: string,
    block?: string
  ): Promise<RepositoryResponse<ResidenceWithSociety[]>>;

  findByIdWithMembers(
    residenceId: string
  ): Promise<RepositoryResponse<ResidenceWithMembers>>;

  searchBySocietyAndFlatNumber(
    societyId: string,
    searchTerm: string
  ): Promise<RepositoryResponse<ResidenceWithSociety[]>>;

  searchBySocietyAndResidentName(
    societyId: string,
    searchTerm: string
  ): Promise<RepositoryResponse<ResidenceWithSociety[]>>;
}

export interface IResidenceService {
  fetchResidenceWithSociety(
    residenceId: string
  ): Promise<RepositoryResponse<ResidenceWithSociety>>;

  requestResidenceMembership(
    residenceId: string,
    userId: string,
    role?: string
  ): Promise<RepositoryResponse<PendingResidenceMembership>>;

  getResidenceMembers(
    residenceId: string
  ): Promise<RepositoryResponse<ResidenceMembersResponse>>;

  searchResidences(
    societyId: string,
    searchTerm: string,
    searchType: "flat" | "resident"
  ): Promise<RepositoryResponse<ResidenceWithSociety[]>>;
}
