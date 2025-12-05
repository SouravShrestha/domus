import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { fetchUserResidencesWithRole } from "@api/services/user.service";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import { MemberRole } from "@/types/models/memberPermissions";

type ResidenceWithRole = ResidenceWithSociety & {
  userRole: MemberRole;
  membershipId: string;
};

type ResidenceContextType = {
  residences: ResidenceWithRole[];
  currentResidence: ResidenceWithRole | null;
  isLoading: boolean;
  hasMembership: boolean;
  hasMultipleResidences: boolean;
  isOwner: boolean;
  userRole: MemberRole | null;
  setCurrentResidence: (residence: ResidenceWithRole) => void;
  loadResidences: (userId: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

  const loadResidences = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchUserResidencesWithRole(userId);

      if (error) {
        console.error("Error fetching residences:", error);
        setResidences([]);
        setCurrentResidence(null);
      } else if (data && data.length > 0) {
        const residencesWithRole: ResidenceWithRole[] = data.map((item) => ({
          ...item.residence,
          userRole: item.role as MemberRole,
          membershipId: item.id,
        }));
        setResidences(residencesWithRole);
        setCurrentResidence(residencesWithRole[0]);
      } else {
        setResidences([]);
        setCurrentResidence(null);
      }
    } catch (error) {
      console.error("Error loading residences:", error);
      setResidences([]);
      setCurrentResidence(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResidences = useCallback(() => {
    setResidences([]);
    setCurrentResidence(null);
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
      isLoading,
      hasMembership,
      hasMultipleResidences,
      isOwner,
      userRole,
      setCurrentResidence,
      loadResidences,
      clearResidences,
    }),
    [
      residences,
      currentResidence,
      isLoading,
      hasMembership,
      hasMultipleResidences,
      isOwner,
      userRole,
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
