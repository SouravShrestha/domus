import React from "react";
import { Stack } from "expo-router";
import { useAuth } from "@contexts/authContext";

const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="verify" />
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
};

export default AuthLayout;
