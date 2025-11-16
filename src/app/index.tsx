import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@contexts/authContext";
import Loader from "@components/widgets/Loader";
import { ROUTES } from "@constants/routes";

const Index: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, hasBasicInfo, isLoading: isAuthLoading } = useAuth();
  const [minLoading, setMinLoading] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoading(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAuthLoading && minLoading) {
      if (isAuthenticated && hasBasicInfo) {
        router.replace(ROUTES.TABS.HOME);
      } else {
        router.replace(ROUTES.AUTH.WELCOME);
      }
    }
  }, [isAuthLoading, minLoading, isAuthenticated, hasBasicInfo, router]);

  return <Loader />;
};

export default Index;
