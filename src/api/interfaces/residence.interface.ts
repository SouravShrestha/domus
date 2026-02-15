import { PendingResidenceMembership } from "@models/residenceMembership";
import { ResidenceWithSociety, ResidenceWithOccupancy } from "@/types/api/response/residence";
import { ApiResponse } from "@/api/types/apiResponse";
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
  ): Promise<ApiResponse<ResidenceWithSociety>>;

  findMembersByResidenceId(
    residenceId: string
  ): Promise<ApiResponse<ResidenceMembersResponse>>;

  findAllBySocietyId(
    societyId: string,
    block?: string
  ): Promise<ApiResponse<ResidenceWithOccupancy[]>>;

  findByIdWithMembers(
    residenceId: string
  ): Promise<ApiResponse<ResidenceWithMembers>>;

  searchBySocietyAndFlatNumber(
    societyId: string,
    searchTerm: string
  ): Promise<ApiResponse<ResidenceWithSociety[]>>;

  searchBySocietyAndResidentName(
    societyId: string,
    searchTerm: string
  ): Promise<ApiResponse<ResidenceWithSociety[]>>;

  convertOwnerToAdult(
    membershipId: string
  ): Promise<ApiResponse<null>>;
}

export interface IResidenceService {
  fetchResidenceWithSociety(
    residenceId: string
  ): Promise<ApiResponse<ResidenceWithSociety>>;

  requestResidenceMembership(
    residenceId: string,
    userId: string,
    role?: string
  ): Promise<ApiResponse<PendingResidenceMembership>>;

  getResidenceMembers(
    residenceId: string
  ): Promise<ApiResponse<ResidenceMembersResponse>>;

  searchResidences(
    societyId: string,
    searchTerm: string,
    searchType: "flat" | "resident"
  ): Promise<ApiResponse<ResidenceWithSociety[]>>;
}
