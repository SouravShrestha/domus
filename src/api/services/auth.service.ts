import { supabase_client } from "../client";
import { apiLogger } from '../utils/logger';

export const sendOtp = async (phone: string) => {
  return await supabase_client.auth.signInWithOtp({
    phone: phone,
  });
};

export const verifyOtp = async (phone: string, token: string) => {
  return await supabase_client.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });
};

export const getSession = async () => {
  const start = performance.now();
  const result = await supabase_client.auth.getSession();
  const duration = performance.now() - start;
  apiLogger.info("AuthService", `getSession took ${duration.toFixed(2)}ms`);
  return result;
};

export const refreshSession = async () => {
  return await supabase_client.auth.refreshSession();
};

export const logout = async () => {
  return await supabase_client.auth.signOut();
};
