import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuth } from "@contexts/authContext";
import { GuardProvider, useGuard } from "@contexts/guardContext";

const GuardLayoutContent: React.FC = () => {
  const { isAuthenticated, userType, user } = useAuth();
  const { loadGuardInfo } = useGuard();

  // Guard layout should only be accessible by guards
  const isGuard = isAuthenticated && userType === "guard";

  useEffect(() => {
    if (isGuard && user?.id) {
      loadGuardInfo(user.id);
    }
  }, [isGuard, user?.id, loadGuardInfo]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Protected guard={isGuard}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
};

const GuardLayout: React.FC = () => {
  return (
    <GuardProvider>
      <GuardLayoutContent />
    </GuardProvider>
  );
};

export default GuardLayout;
