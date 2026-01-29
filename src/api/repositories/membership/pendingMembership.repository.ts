import { PendingResidenceMembership } from "@models/residenceMembership";
import { supabase_client } from "../../client";
import { IPendingMembershipRepository } from "@interfaces/pendingMembership.interface";
import { RepositoryResponse } from "@interfaces/profile.interface";
import {
  ResidenceResponse,
  ResidenceWithMembershipStatus,
} from "@/types/api/response/residence";

type PendingMembershipData = {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  residence: {
    id: string;
    short_name: string;
    flat_number: string;
    block: string | null;
    floor_number: number | null;
    society_id: string;
    created_at: string;
  };
  society: {
    society: {
      id: string;
      name: string;
      code: string;
      address: {
        street: string;
        city: string;
        state: string;
        zip_code?: string;
        zipCode?: string;
      };
      latitude: number;
      longitude: number;
      image_url: string | null;
      created_at: string;
    };
  };
  status_history: {
    status: string;
    created_at: string;
    notes: string | null;
    changed_by: string | null;
  }[];
};

export class SupabasePendingMembershipRepository
  implements IPendingMembershipRepository
{
  private readonly tableName = "pending_residence_memberships";

  async findByUserIdWithResidenceAndSociety(
    userId?: string
  ): Promise<RepositoryResponse<ResidenceResponse>> {
    const { data, error } = await supabase_client
      .from(this.tableName)
      .select(
        `
        id,
        status,
        created_at,
        updated_at,
        residence:residences!inner(
          id,
          short_name,
          flat_number,
          block,
          floor_number,
          society_id,
          created_at
        ),
        society:residences!inner(
          society:societies!inner(
            id,
            name,
            code,
            address,
            latitude,
            longitude,
            image_url,
            created_at
          )
        ),
        status_history:membership_status_history(
          status,
          created_at,
          notes,
          changed_by
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .returns<PendingMembershipData[]>();

    if (error) {
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    const transformedData: ResidenceResponse = data.map(
      (item: PendingMembershipData): ResidenceWithMembershipStatus => ({
        membershipId: item.id,
        residence: {
          id: item.residence.id,
          societyId: item.residence.society_id,
          flatNumber: item.residence.flat_number,
          block: item.residence.block,
          floorNumber: item.residence.floor_number,
          shortName: item.residence.short_name,
          isOccupied: false,
          createdAt: item.residence.created_at,
        },
        society: {
          id: item.society.society.id,
          name: item.society.society.name,
          code: item.society.society.code,
          address: {
            street: item.society.society.address.street,
            city: item.society.society.address.city,
            state: item.society.society.address.state,
            zipCode:
              item.society.society.address.zip_code ||
              item.society.society.address.zipCode ||
              "",
          },
          latitude: item.society.society.latitude,
          longitude: item.society.society.longitude,
          imageUrl: item.society.society.image_url,
          logoUrl: item.society.society.image_url || "",
          createdAt: item.society.society.created_at,
        },
        membershipStatus: item.status,
        membershipStatusHistory: item.status_history
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          .map((h) => ({
            status: h.status,
            statusSetAt: h.created_at,
          })),
      })
    );

    return { data: transformedData, error: null };
  }

  async findByUserAndResidence(
    userId: string,
    residenceId: string,
    statuses: string[]
  ): Promise<RepositoryResponse<Pick<PendingResidenceMembership, "id" | "status">>> {
    return supabase_client
      .from(this.tableName)
      .select("id, status")
      .eq("user_id", userId)
      .eq("residence_id", residenceId)
      .in("status", statuses)
      .maybeSingle();
  }

  async findById(
    membershipId: string
  ): Promise<RepositoryResponse<PendingResidenceMembership>> {
    return supabase_client
      .from(this.tableName)
      .select("*")
      .eq("id", membershipId)
      .single();
  }

  async create(membership: {
    user_id: string;
    residence_id: string;
    role: string;
    status: string;
    invitation_id: string | null;
  }): Promise<RepositoryResponse<PendingResidenceMembership>> {
    return supabase_client
      .from(this.tableName)
      .insert(membership)
      .select()
      .single();
  }

  async findByUserIdWithDetails(
    userId: string
  ): Promise<RepositoryResponse<unknown[]>> {
    return supabase_client
      .from(this.tableName)
      .select(
        `
        *,
        residence:residences(
          *,
          society:societies(*)
        ),
        status_history:membership_status_history(
          status,
          status_set_at
        )
      `
      )
      .eq("user_id", userId);
  }
}

export const pendingMembershipRepository =
  new SupabasePendingMembershipRepository();
