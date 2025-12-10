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
import { checkIfUserIsManager } from "@api/services/manager.service";
import { fetchUserResidencesWithRole } from "@api/services/user.service";
import { supabase_client } from "@api/client";
import type { Session, User } from "@supabase/supabase-js";
import { ensurePhoneHasPlusPrefix } from "@utils/phoneHelpers";
import { UserProfile, UserType } from "@/types/models/user";
import { unregisterPushToken } from "@services/pushNotifications";

// ViewMode determines which UI the user sees - managers default to "resident" view
export type ViewMode = "resident" | "manager" | "guard";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasBasicInfo: boolean;
  userType: UserType;
  // View mode management for role switching
  activeViewMode: ViewMode;
  isManager: boolean; // True if user has manager role (can switch to manager view)
  switchViewMode: (mode: ViewMode) => void;
  signOut: () => Promise<void>;
  refreshSessionOnly: (newSession?: Session | null) => Promise<void>;
  refreshProfile: () => Promise<void>;
  runRoleDetection: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeViewMode, setActiveViewMode] = useState<ViewMode>("resident");
  const [isManager, setIsManager] = useState(false);

  const getProfile = async (uid: string): Promise<UserProfile | null> => {
    const { data } = await fetchProfile(uid);
    if (data && data.phone) {
      data.phone = ensurePhoneHasPlusPrefix(data.phone);
    }
    setProfile(data || null);

    // Check if user is a manager (regardless of their user_type)
    const { data: managerCheck } = await checkIfUserIsManager(uid);
    const userIsManager = managerCheck ?? false;
    setIsManager(userIsManager);

    // Check if user has any residence memberships
    const { data: residences } = await fetchUserResidencesWithRole(uid);
    const hasResidence = residences && residences.length > 0;

    // Set default view mode based on user type and residence status
    if (data?.user_type === "guard") {
      // Guards always see guard view
      setActiveViewMode("guard");
    } else if (userIsManager) {
      // Managers: default to resident view if they have a residence, otherwise manager view
      setActiveViewMode(hasResidence ? "resident" : "manager");
    } else {
      // Regular residents
      setActiveViewMode("resident");
    }

    return data || null;
  };

  const switchViewMode = (mode: ViewMode) => {
    // Only allow switching to manager if user is actually a manager
    if (mode === "manager" && !isManager) {
      console.log(
        "[Auth] Cannot switch to manager mode: user is not a manager"
      );
      return;
    }
    setActiveViewMode(mode);
  };

  const runRoleDetection = async () => {
    if (!session?.user?.id || !profile?.phone) {
      console.log("[Auth] Cannot run role detection: missing user ID or phone");
      return;
    }

    const { data, error } = await detectAndAssignRole(
      session.user.id,
      profile.phone
    );

    if (error) {
      console.error("[Auth] Role detection error:", error);
      return;
    }

    if (data && data.detectedRole !== "resident") {
      // Role was changed, refresh profile to get updated user_type
      await getProfile(session.user.id);
    }
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

    const { data: sub } = supabase_client.auth.onAuthStateChange(
      async (event, s) => {
        if (event === "INITIAL_SESSION") {
          return;
        }

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
      }
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Unregister push token before signing out
    await unregisterPushToken();
    await logout();
    setSession(null);
    setProfile(null);
    setIsManager(false);
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

  const userType: UserType = profile?.user_type || "resident";

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        profile,
        isLoading,
        isAuthenticated: !!session,
        hasBasicInfo: profile?.onboarded_basic === true,
        userType,
        activeViewMode,
        isManager,
        switchViewMode,
        signOut,
        refreshSessionOnly,
        refreshProfile,
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
