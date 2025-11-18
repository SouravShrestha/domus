import { supabase_client } from "./client";
import { Society } from "@models/society";
import { 
  ApprovedResidenceMembership, 
  ResidenceMembershipInvitation,
  PendingResidenceMembership,
  RejectedResidenceMembershipInvitation
} from "@models/residenceMembership";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import { ApprovedResidenceMembershipWithResidence } from "@/types/api/response/residenceMembership";
import { InviteResponse } from "@/types/api/response/invite";
import type { PostgrestError } from "@supabase/supabase-js";
import { generateInviteCode } from "@/utils/textHelpers";

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

export const inviteUserToResidence = async (
  userPhoneNumber: string,
  residenceId: string,
  role: string,
  autoApprove: boolean = false
): Promise<{ data: ResidenceMembershipInvitation | null; error: PostgrestError | null }> => {
  // Check if user with this phone number already has an approved membership
  const { data: user } = await supabase_client
    .from("user_profiles")
    .select("id")
    .eq("phone", userPhoneNumber)
    .maybeSingle();

  if (user?.id) {
    const { data: existingMembership, error: checkMembershipError } = await supabase_client
      .from("approved_residence_memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("residence_id", residenceId)
      .maybeSingle();

    if (checkMembershipError) {
      return { data: null, error: checkMembershipError };
    }

    if (existingMembership) {
      return {
        data: null,
        error: {
          message: "User is already a member of this residence",
          details: "Membership already exists",
          hint: null,
          code: "23505",
        } as PostgrestError,
      };
    }
  }

  // Check if there's already an active invitation (invited or accepted)
  const { data: existingInvitation, error: checkInvitationError } = await supabase_client
    .from("residence_membership_invitations")
    .select("id")
    .eq("user_phone_number", userPhoneNumber)
    .eq("residence_id", residenceId)
    .in("status", ["invited", "accepted"])
    .maybeSingle();

  if (checkInvitationError) {
    return { data: null, error: checkInvitationError };
  }

  if (existingInvitation) {
    return {
      data: null,
      error: {
        message: "An invitation already exists for this phone number and residence",
        details: "Invitation already exists",
        hint: null,
        code: "23505",
      } as PostgrestError,
    };
  }

  // Generate a unique invite code
  let inviteCode: string | null = null;
  let attempts = 0;
  const maxAttempts = 10;

  while (!inviteCode && attempts < maxAttempts) {
    const candidateCode = generateInviteCode();
    
    // Check if this code already exists
    const { data: existingCode } = await supabase_client
      .from("residence_membership_invitations")
      .select("id")
      .eq("invite_code", candidateCode)
      .maybeSingle();

    if (!existingCode) {
      inviteCode = candidateCode;
    } else {
      attempts++;
    }
  }

  if (!inviteCode) {
    return {
      data: null,
      error: {
        message: "Failed to generate unique invite code",
        details: "Please try again",
        hint: null,
        code: "GENERATION_ERROR",
      } as PostgrestError,
    };
  }

  // Insert into residence_membership_invitations table with status "invited"
  const { data, error } = await supabase_client
    .from("residence_membership_invitations")
    .insert({
      user_phone_number: userPhoneNumber,
      residence_id: residenceId,
      role: role,
      status: "invited",
      auto_approve: autoApprove,
      invite_code: inviteCode,
    })
    .select()
    .single();

  return { data, error };
};

export const acceptResidenceInvitation = async (
  invitationId: string,
  userId: string,
  userPhoneNumber: string
): Promise<{ 
  data: ApprovedResidenceMembership | PendingResidenceMembership | null; 
  error: PostgrestError | null 
}> => {
  // Fetch the invitation and verify it belongs to the user by phone number
  const { data: invitation, error: fetchError } = await supabase_client
    .from("residence_membership_invitations")
    .select("*")
    .eq("id", invitationId)
    .eq("user_phone_number", userPhoneNumber)
    .eq("status", "invited")
    .single();

  if (fetchError || !invitation) {
    return {
      data: null,
      error: fetchError || {
        message: "Invitation not found or already processed",
        details: "Invalid invitation",
        hint: null,
        code: "PGRST116",
      } as PostgrestError,
    };
  }

  // Check if user already has an approved membership
  const { data: existingMembership } = await supabase_client
    .from("approved_residence_memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("residence_id", invitation.residence_id)
    .maybeSingle();

  if (existingMembership) {
    // Update invitation status to accepted even though membership exists
    await supabase_client
      .from("residence_membership_invitations")
      .update({ status: "accepted" })
      .eq("id", invitationId);

    return {
      data: null,
      error: {
        message: "User is already a member of this residence",
        details: "Membership already exists",
        hint: null,
        code: "23505",
      } as PostgrestError,
    };
  }

  // Update invitation status to accepted
  const { error: updateError } = await supabase_client
    .from("residence_membership_invitations")
    .update({ status: "accepted" })
    .eq("id", invitationId);

  if (updateError) {
    return { data: null, error: updateError };
  }

  // If auto_approve is true, directly add to approved_residence_memberships
  if (invitation.auto_approve) {
    const { data: approvedMembership, error: approveError } = await supabase_client
      .from("approved_residence_memberships")
      .insert({
        user_id: userId,
        residence_id: invitation.residence_id,
        role: invitation.role,
      })
      .select()
      .single();

    return { data: approvedMembership, error: approveError };
  }

  // Otherwise, add to pending_residence_memberships
  const { data: pendingMembership, error: pendingError } = await supabase_client
    .from("pending_residence_memberships")
    .insert({
      user_id: userId,
      residence_id: invitation.residence_id,
      role: invitation.role,
      invitation_id: invitationId,
    })
    .select()
    .single();

  return { data: pendingMembership, error: pendingError };
};

export const rejectResidenceInvitation = async (
  invitationId: string,
  userPhoneNumber: string
): Promise<{ 
  data: RejectedResidenceMembershipInvitation | null; 
  error: PostgrestError | null 
}> => {
  // Fetch the invitation and verify it belongs to the user by phone number
  const { data: invitation, error: fetchError } = await supabase_client
    .from("residence_membership_invitations")
    .select("*")
    .eq("id", invitationId)
    .eq("user_phone_number", userPhoneNumber)
    .eq("status", "invited")
    .single();

  if (fetchError || !invitation) {
    return {
      data: null,
      error: fetchError || {
        message: "Invitation not found or already processed",
        details: "Invalid invitation",
        hint: null,
        code: "PGRST116",
      } as PostgrestError,
    };
  }

  // Update invitation status to rejected
  const { error: updateError } = await supabase_client
    .from("residence_membership_invitations")
    .update({ status: "rejected" })
    .eq("id", invitationId);

  if (updateError) {
    return { data: null, error: updateError };
  }

  // Insert into rejected_residence_membership_invitations table
  const { data: rejectedInvitation, error: insertError } = await supabase_client
    .from("rejected_residence_membership_invitations")
    .insert({
      user_phone_number: invitation.user_phone_number,
      residence_id: invitation.residence_id,
      role: invitation.role,
      invitation_id: invitationId,
    })
    .select()
    .single();

  return { data: rejectedInvitation, error: insertError };
};

export const searchInviteCode = async (
  inviteCode: string,
  userPhoneNumber: string
): Promise<{ data: InviteResponse | null; error: PostgrestError | null }> => {
  // Fetch invitation with residence and society data
  const { data: invitation, error: fetchError } = await supabase_client
    .from("residence_membership_invitations")
    .select(`
      *,
      residence:residences(
        id,
        short_name,
        society:societies(
          id,
          name
        )
      )
    `)
    .eq("invite_code", inviteCode)
    .eq("user_phone_number", userPhoneNumber)
    .maybeSingle();

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  if (!invitation) {
    return {
      data: null,
      error: {
        message: "Invite code not found or does not belong to you",
        details: "Invalid invite code",
        hint: null,
        code: "PGRST116",
      } as PostgrestError,
    };
  }

  // Get inviter name - try to get from approved memberships of the residence
  // For now, we'll use a placeholder or try to get a member name
  let invitedByUserName = "Admin";
  try {
    const { data: members } = await supabase_client
      .from("approved_residence_memberships")
      .select(`
        user_id,
        user_profiles!approved_residence_memberships_user_id_fkey(name)
      `)
      .eq("residence_id", invitation.residence_id)
      .limit(1)
      .maybeSingle();
    
    if (members && 'user_profiles' in members && members.user_profiles?.name) {
      invitedByUserName = members.user_profiles.name;
    }
  } catch {
    // If we can't get the inviter name, use default
  }

  // Transform to InviteResponse format
  const residence = invitation.residence as any;
  const society = residence?.society as any;

  const inviteResponse: InviteResponse = {
    id: invitation.id,
    code: invitation.invite_code,
    residenceShortName: residence?.short_name || "Unknown",
    societyName: society?.name || "Unknown",
    invitedByUserName,
    used: invitation.status !== "invited",
    expiresAt: invitation.created_at ? new Date(new Date(invitation.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined, // 30 days from creation
    residentRole: invitation.role,
    // Visitor invite fields would be added here if needed
  };

  return { data: inviteResponse, error: null };
};

