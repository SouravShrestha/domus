import React from "react";
import { Stack } from "expo-router";
import { useAuth } from "@contexts/authContext";

const GuardLayout: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();

  // Guard layout should only be accessible by guards
  const isGuard = isAuthenticated && userType === "guard";

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

export default GuardLayout;

