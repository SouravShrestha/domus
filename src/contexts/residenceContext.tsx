import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { fetchUserResidences } from "@api/services/user.service";
import { ResidenceWithSociety } from "@/types/api/response/residence";

type ResidenceContextType = {
  residences: ResidenceWithSociety[];
  currentResidence: ResidenceWithSociety | null;
  isLoading: boolean;
  hasMembership: boolean;
  hasMultipleResidences: boolean;
  setCurrentResidence: (residence: ResidenceWithSociety) => void;
  loadResidences: (userId: string) => Promise<void>;
  clearResidences: () => void;
};

const ResidenceContext = createContext<ResidenceContextType | null>(null);

type ResidenceProviderProps = {
  children: ReactNode;
};

export function ResidenceProvider({ children }: ResidenceProviderProps) {
  const [residences, setResidences] = useState<ResidenceWithSociety[]>([]);
  const [currentResidence, setCurrentResidence] =
    useState<ResidenceWithSociety | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadResidences = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchUserResidences(userId);

      if (error) {
        console.error("Error fetching residences:", error);
        setResidences([]);
        setCurrentResidence(null);
      } else if (data && data.length > 0) {
        setResidences(data);
        setCurrentResidence(data[0]);
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

  return (
    <ResidenceContext.Provider
      value={{
        residences,
        currentResidence,
        isLoading,
        hasMembership,
        hasMultipleResidences,
        setCurrentResidence,
        loadResidences,
        clearResidences,
      }}
    >
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
