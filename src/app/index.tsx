import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@contexts/authContext";
import Loader from "@components/widgets/Loader";
import { ROUTES } from "@constants/routes";

const Index: React.FC = () => {
  const router = useRouter();
  const {
    isAuthenticated,
    hasBasicInfo,
    isLoading: isAuthLoading,
    activeViewMode,
  } = useAuth();
  const [minLoading, setMinLoading] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoading(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAuthLoading && minLoading) {
      if (isAuthenticated && hasBasicInfo) {
        switch (activeViewMode) {
          case "guard":
            router.replace(ROUTES.GUARD.HOME);
            break;
          case "manager":
            router.replace(ROUTES.MANAGER.HOME);
            break;
          case "no_access":
            router.replace(ROUTES.RESIDENT.HOME);
            break;
          default:
            router.replace(ROUTES.RESIDENT.HOME);
        }
      } else {
        router.replace(ROUTES.AUTH.WELCOME);
      }
    }
  }, [
    isAuthLoading,
    minLoading,
    isAuthenticated,
    hasBasicInfo,
    activeViewMode,
    router,
  ]);

  return <Loader />;
};

export default Index;
