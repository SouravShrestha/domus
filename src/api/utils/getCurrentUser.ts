import { supabase_client } from '../client';

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user }, error } = await supabase_client.auth.getUser();
  if (error || !user) return null;
  return user.id;
}
