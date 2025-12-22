import React from "react";
import { Stack } from "expo-router";
import { useAuth } from "@contexts/authContext";

const ManagerLayout: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();

  // Manager layout should only be accessible by managers
  const isManager = isAuthenticated && userType === "manager";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Protected guard={isManager}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="screens/add-guard" />
        <Stack.Screen
          name="screens/profile/profileScreen"
          options={{ animation: "slide_from_right" }}
        />
      </Stack.Protected>
    </Stack>
  );
};

export default ManagerLayout;
