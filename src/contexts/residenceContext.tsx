import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { fetchUserResidencesWithRole } from "@api/services/user.service";
import { getManagerSocietiesAsResidences } from "@api/services/manager.service";
import { getMemberPermissions } from "@api/services/memberPermissions.service";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import { MemberRole, MemberPermissions } from "@/types/models/memberPermissions";
import { UserType } from "@/types/models/user";

type ResidenceWithRole = ResidenceWithSociety & {
  userRole: MemberRole;
  membershipId: string;
};

type ResidenceContextType = {
  residences: ResidenceWithRole[];
  currentResidence: ResidenceWithRole | null;
  permissions: MemberPermissions | null;
  isLoading: boolean;
  hasMembership: boolean;
  hasMultipleResidences: boolean;
  isOwner: boolean;
  userRole: MemberRole | null;
  setCurrentResidence: (residence: ResidenceWithRole) => void;
  loadResidences: (userId: string, userType?: UserType) => Promise<void>;
  clearResidences: () => void;
};

const ResidenceContext = createContext<ResidenceContextType | null>(null);

type ResidenceProviderProps = {
  children: ReactNode;
};

export function ResidenceProvider({ children }: ResidenceProviderProps) {
  const [residences, setResidences] = useState<ResidenceWithRole[]>([]);
  const [currentResidence, setCurrentResidence] =
    useState<ResidenceWithRole | null>(null);
  const [permissions, setPermissions] = useState<MemberPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = useCallback(async (membershipId: string) => {
    const { data, error } = await getMemberPermissions(membershipId);
    if (data) {
      setPermissions(data);
    } else {
      console.error("Error fetching permissions:", error);
      setPermissions(null);
    }
  }, []);

  const loadResidences = useCallback(async (userId: string, userType: UserType = "resident") => {
    setIsLoading(true);
    try {
      let residencesData;
      
      if (userType === "manager") {
        const { data, error } = await getManagerSocietiesAsResidences(userId);
        if (error) {
          console.error("Error fetching manager societies:", error);
          residencesData = null;
        } else {
          residencesData = data;
        }
      } else {
        const { data, error } = await fetchUserResidencesWithRole(userId);
        if (error) {
          console.error("Error fetching residences:", error);
          residencesData = null;
        } else {
          residencesData = data;
        }
      }

      if (!residencesData || residencesData.length === 0) {
        setResidences([]);
        setCurrentResidence(null);
        setPermissions(null);
      } else {
        const residencesWithRole: ResidenceWithRole[] = residencesData.map((item) => ({
          ...item.residence,
          userRole: item.role as MemberRole,
          membershipId: item.id,
        }));
        setResidences(residencesWithRole);
        const firstResidence = residencesWithRole[0];
        setCurrentResidence(firstResidence);
        
        if (userType !== "manager" && firstResidence.membershipId) {
          await fetchPermissions(firstResidence.membershipId);
        } else {
          setPermissions(null);
        }
      }
    } catch (error) {
      console.error("Error loading residences:", error);
      setResidences([]);
      setCurrentResidence(null);
      setPermissions(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPermissions]);

  const handleSetCurrentResidence = useCallback(async (residence: ResidenceWithRole) => {
    setCurrentResidence(residence);
    if (residence.membershipId) {
      await fetchPermissions(residence.membershipId);
    } else {
        setPermissions(null);
    }
  }, [fetchPermissions]);

  const clearResidences = useCallback(() => {
    setResidences([]);
    setCurrentResidence(null);
    setPermissions(null);
    setIsLoading(true);
  }, []);

  const hasMembership = residences.length > 0;
  const hasMultipleResidences = residences.length > 1;
  const isOwner = currentResidence?.userRole === "owner";
  const userRole = currentResidence?.userRole ?? null;

  const contextValue = useMemo(
    () => ({
      residences,
      currentResidence,
      permissions,
      isLoading,
      hasMembership,
      hasMultipleResidences,
      isOwner,
      userRole,
      setCurrentResidence: handleSetCurrentResidence,
      loadResidences,
      clearResidences,
    }),
    [
      residences,
      currentResidence,
      permissions,
      isLoading,
      hasMembership,
      hasMultipleResidences,
      isOwner,
      userRole,
      handleSetCurrentResidence,
      loadResidences,
      clearResidences,
    ]
  );

  return (
    <ResidenceContext.Provider value={contextValue}>
      {children}
    </ResidenceContext.Provider>
  );
}

export const useResidence = (): ResidenceContextType => {
  const context = useContext(ResidenceContext);
  if (!context) {
    throw new Error("useResidence must be used within a ResidenceProvider");
  }
  return context;
};
