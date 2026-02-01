import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { fetchProfile } from "@api/services/profile.service";
import { getSession, logout, refreshSession } from "@api/services/auth.service";
import { detectAndAssignRole } from "@api/services/roleDetection.service";
import { fetchUserAccessInfo } from "@api/services/accessInfo.service";
import { supabase_client } from "@api/client";
import type { Session, User } from "@supabase/supabase-js";
import { ensurePhoneHasPlusPrefix } from "@utils/phoneHelpers";
import { UserProfile } from "@/types/models/user";
import { UserAccessInfo } from "@/types/models/accessInfo";
import { unregisterPushToken } from "@services/pushNotifications";

export type ViewMode = "resident" | "manager" | "guard" | "no_access";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  accessInfo: UserAccessInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasBasicInfo: boolean;
  activeViewMode: ViewMode;
  isManager: boolean;
  isGuard: boolean;
  isResident: boolean;
  switchViewMode: (mode: ViewMode) => void;
  signOut: () => Promise<void>;
  refreshSessionOnly: (newSession?: Session | null) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshAccessInfo: () => Promise<void>;
  runRoleDetection: (phone?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accessInfo, setAccessInfo] = useState<UserAccessInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeViewMode, setActiveViewMode] = useState<ViewMode>("resident");

  const loadAccessInfo = async (
    uid: string,
  ): Promise<UserAccessInfo | null> => {
    const { data, error } = await fetchUserAccessInfo(uid);
    if (error) {
      console.error("[Auth] Error fetching access info:", error);
      return null;
    }
    setAccessInfo(data);
    return data;
  };

  const getProfile = async (uid: string): Promise<UserProfile | null> => {
    const { data } = await fetchProfile(uid);
    if (data && data.phone) {
      data.phone = ensurePhoneHasPlusPrefix(data.phone);
    }
    setProfile(data || null);

    const access = await loadAccessInfo(uid);

    // Determine default view mode based on access info
    if (access && access.societies.length > 0) {
      const firstSociety = access.societies[0];
      if (firstSociety.isGuard) {
        setActiveViewMode("guard");
      } else if (firstSociety.isResident) {
        setActiveViewMode("resident");
      } else if (firstSociety.isManager) {
        setActiveViewMode("manager");
      } else {
        setActiveViewMode("no_access");
      }
    } else if (access && access.roles.length > 0) {
      if (access.roles.includes("guard")) {
        setActiveViewMode("guard");
      } else if (access.roles.includes("manager")) {
        setActiveViewMode("manager");
      } else {
        setActiveViewMode("resident");
      }
    } else {
      setActiveViewMode("no_access");
    }

    return data || null;
  };

  const switchViewMode = (mode: ViewMode) => {
    if (mode === "manager" && !accessInfo?.roles.includes("manager")) {
      console.log(
        "[Auth] Cannot switch to manager mode: user is not a manager",
      );
      return;
    }
    if (mode === "guard" && !accessInfo?.roles.includes("guard")) {
      console.log("[Auth] Cannot switch to guard mode: user is not a guard");
      return;
    }
    setActiveViewMode(mode);
  };

  const runRoleDetection = async (phoneParam?: string) => {
    const rawPhone = phoneParam || profile?.phone || session?.user?.phone;
    if (!session?.user?.id || !rawPhone) {
      console.log("[Auth] Cannot run role detection: missing user ID or phone");
      return;
    }

    const phone = ensurePhoneHasPlusPrefix(rawPhone);
    console.log("[Auth] Running role detection for phone:", phone);
    const { data, error } = await detectAndAssignRole(session.user.id, phone);

    if (error) {
      console.error("[Auth] Role detection error:", error);
      return;
    }

    if (data && data.detectedRole !== "resident") {
      await getProfile(session.user.id);
    }
  };

  const refreshAccessInfo = async () => {
    if (session?.user?.id) {
      await loadAccessInfo(session.user.id);
    }
  };

  useEffect(() => {
    let initialSessionReceived = false;
    let subscription: { unsubscribe: () => void } | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const init = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("[Auth] Setting up onAuthStateChange...");
      const setupStart = Date.now();

      const { data: sub } = supabase_client.auth.onAuthStateChange(
        async (event, s) => {
          const callbackTime = Date.now() - setupStart;
          console.log(
            `[Auth] onAuthStateChange event: ${event}, time since setup: ${callbackTime}ms, hasSession: ${!!s}`,
          );

          if (event === "INITIAL_SESSION") {
            initialSessionReceived = true;
            if (fallbackTimer) clearTimeout(fallbackTimer);
            console.log(
              "[Auth] INITIAL_SESSION received, user id:",
              s?.user?.id,
            );
            setSession(s);
            if (s?.user?.id) {
              console.log("[Auth] Loading profile for user:", s.user.id);
              const profileStart = Date.now();
              await getProfile(s.user.id);
              console.log(
                `[Auth] Profile loaded in ${Date.now() - profileStart}ms`,
              );
            }
            console.log("[Auth] Setting isLoading to false");
            setIsLoading(false);
            return;
          }

          if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
            setSession(s);
            if (s?.user?.id) {
              const loadedProfile = await getProfile(s.user.id);
              if (
                event === "SIGNED_IN" &&
                loadedProfile?.onboarded_basic &&
                s.user.phone
              ) {
                const phone = ensurePhoneHasPlusPrefix(s.user.phone);
                const { data: roleResult } = await detectAndAssignRole(
                  s.user.id,
                  phone,
                );
                if (roleResult && roleResult.detectedRole !== "resident") {
                  await getProfile(s.user.id);
                }
              }
            }
          } else if (event === "SIGNED_OUT") {
            setSession(null);
            setProfile(null);
            setAccessInfo(null);
          } else {
            setSession(s);
            if (s?.user?.id) await getProfile(s.user.id);
            else {
              setProfile(null);
              setAccessInfo(null);
            }
          }
        },
      );

      subscription = sub.subscription;

      fallbackTimer = setTimeout(() => {
        if (!initialSessionReceived) {
          console.log(
            "[Auth] INITIAL_SESSION not received after 3s, proceeding without session",
          );
          setSession(null);
          setIsLoading(false);
        }
      }, 3000);
    };

    init();

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await unregisterPushToken();
    await logout();
    setSession(null);
    setProfile(null);
    setAccessInfo(null);
    setActiveViewMode("resident");
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

  const isManager = accessInfo?.roles.includes("manager") ?? false;
  const isGuard = accessInfo?.roles.includes("guard") ?? false;
  const isResident = accessInfo?.roles.includes("resident") ?? false;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        profile,
        accessInfo,
        isLoading,
        isAuthenticated: !!session,
        hasBasicInfo: profile?.onboarded_basic === true,
        activeViewMode,
        isManager,
        isGuard,
        isResident,
        switchViewMode,
        signOut,
        refreshSessionOnly,
        refreshProfile,
        refreshAccessInfo,
        runRoleDetection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
