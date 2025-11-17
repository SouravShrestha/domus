import { UserProfile } from "@models/user";
import { supabase_client } from "./client";
import { ensurePhoneHasPlusPrefix } from "@utils/phoneHelpers";

export const fetchProfile = async (id: string) => {
  return await supabase_client
    .from("user_profiles")
    .select("*")
    .eq("id", id)
    .single();
};

export const createProfile = async (user: UserProfile) => {
  if (user.email && user.email.trim()) {
    const trimmedEmail = user.email.trim().toLowerCase();
    const { data: existingProfile, error: checkError } = await supabase_client
      .from("user_profiles")
      .select("id")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (checkError) {
      return { data: null, error: checkError };
    }

    if (existingProfile) {
      throw new Error(
        "A profile with this email already exists. Please use a different email address."
      );
    }

    user.email = trimmedEmail;
  }

  user.phone = ensurePhoneHasPlusPrefix(user.phone);

  return await supabase_client.from("user_profiles").insert(user);
};

export const saveBasicInfo = async (user: UserProfile) => {
  user.phone = ensurePhoneHasPlusPrefix(user.phone);
  return await supabase_client.from("user_profiles").upsert(user);
};
