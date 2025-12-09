import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { guardRepository } from "@api/repositories/guard/guard.repository";
import { SocietyGuardWithSociety } from "@/types/models/guard";

type GuardContextType = {
  guardInfo: SocietyGuardWithSociety | null;
  societyId: string | null;
  societyName: string | null;
  isLoading: boolean;
  loadGuardInfo: (userId: string) => Promise<void>;
  clearGuardInfo: () => void;
};

const GuardContext = createContext<GuardContextType | null>(null);

type GuardProviderProps = {
  children: ReactNode;
};

export function GuardProvider({ children }: GuardProviderProps) {
  const [guardInfo, setGuardInfo] = useState<SocietyGuardWithSociety | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadGuardInfo = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await guardRepository.findByUserId(userId);

      if (error) {
        console.error("Error fetching guard info:", error);
        setGuardInfo(null);
      } else if (data && data.length > 0) {
        // Assuming a guard belongs to one society, take the first one
        setGuardInfo(data[0]);
      } else {
        setGuardInfo(null);
      }
    } catch (error) {
      console.error("Error loading guard info:", error);
      setGuardInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearGuardInfo = useCallback(() => {
    setGuardInfo(null);
    setIsLoading(true);
  }, []);

  const societyId = guardInfo?.society_id ?? null;
  const societyName = guardInfo?.society?.name ?? null;

  const contextValue = useMemo(
    () => ({
      guardInfo,
      societyId,
      societyName,
      isLoading,
      loadGuardInfo,
      clearGuardInfo,
    }),
    [
      guardInfo,
      societyId,
      societyName,
      isLoading,
      loadGuardInfo,
      clearGuardInfo,
    ]
  );

  return (
    <GuardContext.Provider value={contextValue}>
      {children}
    </GuardContext.Provider>
  );
}

export const useGuard = (): GuardContextType => {
  const context = useContext(GuardContext);
  if (!context) {
    throw new Error("useGuard must be used within a GuardProvider");
  }
  return context;
};
