import { supabase_client } from "./client";
import { Society } from "@models/society";
import { ApprovedResidenceMembership } from "@models/residenceMembership";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import { ApprovedResidenceMembershipWithResidence } from "@/types/api/response/residenceMembership";
import type { PostgrestError } from "@supabase/supabase-js";

export const fetchResidenceWithSociety = async (
  residenceId: string
): Promise<{ data: ResidenceWithSociety | null; error: PostgrestError | null }> => {
  return await supabase_client
    .from("residences")
    .select(`
      *,
      society:societies(*)
    `)
    .eq("id", residenceId)
    .single();
};

export const fetchUserResidences = async (
  userId: string
): Promise<{ data: ResidenceWithSociety[] | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase_client
    .from("approved_residence_memberships")
    .select(`
      *,
      residence:residences(
        *,
        society:societies(*)
      )
    `)
    .eq("user_id", userId);
      
  if (data) {
    const residences = (data as ApprovedResidenceMembershipWithResidence[])
      .map((membership) => membership.residence)
      .filter((r): r is ResidenceWithSociety => r !== null);
    return { data: residences, error };
  }
  
  return { data: null, error };
};

export const fetchSocietyResidences = async (
  societyId: string
): Promise<{ data: ResidenceWithSociety[] | null; error: PostgrestError | null }> => {
  return await supabase_client
    .from("residences")
    .select(`
      *,
      society:societies(*)
    `)
    .eq("society_id", societyId);
};

export const fetchSociety = async (
  societyId: string
): Promise<{ data: Society | null; error: PostgrestError | null }> => {
  return await supabase_client
    .from("societies")
    .select("*")
    .eq("id", societyId)
    .single();
};

export const fetchUserMemberships = async (
  userId: string
): Promise<{ data: ApprovedResidenceMembership[] | null; error: PostgrestError | null }> => {
  return await supabase_client
    .from("approved_residence_memberships")
    .select("*")
    .eq("user_id", userId);
};

