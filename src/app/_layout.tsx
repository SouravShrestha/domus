import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "@contexts/authContext";
import { ThemeProvider } from "@contexts/themeContext";
import { ResidenceProvider } from "@contexts/residenceContext";
import { PortalHost, PortalProvider } from "@gorhom/portal";
// import { UserProvider } from "@contexts/userContext";
import Toast from "react-native-toast-message";
import { toastConfig } from "@configs/toastConfig";
import { fonts } from "@configs/fonts";
import Loader from "@components/widgets/Loader";

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

const RootLayoutNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

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
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="index" />
    </Stack>
  );
};

const Layout: React.FC = () => {
  const [splashDone, setSplashDone] = useState<boolean>(false);

  const [fontsLoaded] = useFonts(fonts);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsLoaded && splashDone) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, splashDone]);

  if (!fontsLoaded || !splashDone) return null;

  return (
    <AuthProvider>
      <ThemeProvider>
        <ResidenceProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            {/* <UserProvider> */}
            <PortalProvider>
              <RootLayoutNavigator />
              <PortalHost name="global" />
            </PortalProvider>
            {/* @ts-expect-error - Custom toast config type doesn't match library's ToastConfig index signature */}
            <Toast position="top" config={toastConfig} topOffset={40} />
            {/* </UserProvider> */}
          </GestureHandlerRootView>
        </ResidenceProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default Layout;
