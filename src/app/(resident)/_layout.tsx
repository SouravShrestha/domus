import React from "react";
import { Stack } from "expo-router";
import { useAuth } from "@contexts/authContext";

const ResidentLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="screens/invite/enterInviteCodeScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/invite/inviteSuccessScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="screens/membership/membershipStatusScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/membership/noMembership"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/info/onboardSociety"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/info/whyChooseUs"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/qr/qrScanner"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/qr/qrConfirmation"
          options={{
            animation: "fade",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/people/manageFamilyScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/people/manageTenantsScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/people/manageStaffScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/people/addMemberScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/people/familyMemberDetailsScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/people/tenantDetailsScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/people/staffDetailsScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/people/editFamilyMemberPermissionsScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/visitors/inviteGuestScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/visitors/manageVisitorsScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/visitors/visitorHistoryScreen"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
};

export default ResidentLayout;

