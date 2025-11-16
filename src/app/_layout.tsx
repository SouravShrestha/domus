import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "@contexts/authContext";
import { ThemeProvider } from "@contexts/themeContext";
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
          name="screens/manageInvites"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/membershipStatus"
          options={{
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="screens/qrAndPasses"
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
        <GestureHandlerRootView style={{ flex: 1 }}>
          {/* <UserProvider> */}
            <PortalProvider>
              <RootLayoutNavigator />
              <PortalHost name="global" />
            </PortalProvider>
            <Toast position="top" config={toastConfig} topOffset={40} />
          {/* </UserProvider> */}
        </GestureHandlerRootView>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default Layout;
