import React from "react";
import { Stack } from "expo-router";
import { useAuth } from "@contexts/authContext";

const ManagerLayout: React.FC = () => {
  const { isAuthenticated, isManager } = useAuth();

  // Manager layout should only be accessible by managers
  const canAccess = isAuthenticated && isManager;

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
        <Stack.Screen
          name="screens/residences/addOwnerScreen"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/residences/manageOwnersScreen"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/residences/ownerDetailsScreen"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/residences/inviteSuccessScreen"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/noticeBoard/index"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/noticeBoard/create"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/noticeBoard/edit"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/rulesAndGuidelines"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/manageParking"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/manageAmenity"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/serviceRequests"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/societyContacts"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/guards/inviteGuardScreen"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/guards/index"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/guards/guardDetailsScreen"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/guards/manageTimingsScreen"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/guards/editShiftScreen"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/guards/assignDutyScreen"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="screens/services/guards/editDutyScreen"
          options={{ animation: "slide_from_right" }}
        />
      </Stack.Protected>
    </Stack>
  );
};

export default ManagerLayout;
