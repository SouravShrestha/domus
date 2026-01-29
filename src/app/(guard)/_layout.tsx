import React from "react";
import { Stack } from "expo-router";
import { useAuth } from "@contexts/authContext";

const GuardLayout: React.FC = () => {
  const { isAuthenticated, isGuard } = useAuth();

  const canAccess = isAuthenticated && isGuard;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Protected guard={canAccess}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="screens/profile/profileScreen"
          options={{ animation: "slide_from_right" }}
        />
      </Stack.Protected>
    </Stack>
  );
};

export default GuardLayout;
