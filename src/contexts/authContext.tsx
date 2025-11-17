import { createContext, useContext, useEffect, useState } from "react";
import { fetchProfile } from "@api/profile.service";
import { getSession, logout, refreshSession } from "@api/auth.service";
import { supabase_client } from "@api/client";
import type { Session } from "@supabase/supabase-js";
import { ensurePhoneHasPlusPrefix } from "@utils/phoneHelpers";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getProfile = async (uid: string) => {
    const { data } = await fetchProfile(uid);
    if (data && data.phone) {
      data.phone = ensurePhoneHasPlusPrefix(data.phone);
    }
    setProfile(data || null);
  };

  useEffect(() => {
    const hydrate = async () => {
      const { data, error } = await getSession();

      if (error) {
        console.error("Session error:", error);
        setSession(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const s = data.session;
      setSession(s);
      if (s?.user?.id) await getProfile(s.user.id);
      setIsLoading(false);
    };

    (async () => {
      await hydrate();
    })();

    const { data: sub } = supabase_client.auth.onAuthStateChange(async (event, s) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        setSession(s);
        if (s?.user?.id) await getProfile(s.user.id);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setProfile(null);
      } else {
        setSession(s);
        if (s?.user?.id) await getProfile(s.user.id);
        else setProfile(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await logout();
    setSession(null);
    setProfile(null);
  };

  const refreshSessionOnly = async (newSession?: Session | null) => {
    if (newSession) {
      setSession(newSession);
    } else {
      const { data, error } = await refreshSession();
      if (!error && data?.session) {
        setSession(data.session);
      }
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      const { data } = await fetchProfile(session.user.id);
      if (data && data.phone) {
        data.phone = ensurePhoneHasPlusPrefix(data.phone);
      }
      setProfile(data || null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        profile,
        isLoading,
        isAuthenticated: !!session,
        hasBasicInfo: profile?.onboarded_basic === true,
        signOut,
        refreshSessionOnly,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
