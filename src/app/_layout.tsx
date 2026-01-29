import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect, useRef, useState } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { AuthProvider, useAuth } from "@contexts/authContext";
import { ThemeProvider } from "@contexts/themeContext";
import { ResidenceProvider } from "@contexts/residenceContext";
import { PortalHost, PortalProvider } from "@gorhom/portal";
import Toast from "react-native-toast-message";
import { toastConfig } from "@configs/toastConfig";
import { fonts } from "@configs/fonts";
import Loader from "@components/widgets/Loader";
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from "@services/pushNotifications";

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

const RootLayoutNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, activeViewMode } = useAuth();
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Register for push notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Register for push notifications
      // registerForPushNotificationsAsync();
      // Listen for notifications received while app is foregrounded
      // notificationListener.current = addNotificationReceivedListener(
      //   (notification) => {
      //     console.log("Notification received:", notification);
      //   }
      // );
      // Listen for user interaction with notifications
      // responseListener.current = addNotificationResponseReceivedListener(
      //   (response) => {
      //     console.log("Notification response:", response);
      //     // Handle navigation based on notification data here
      //     const data = response.notification.request.content.data;
      //     if (data?.notificationType) {
      //       // You can add navigation logic based on notification type
      //       console.log("Notification type:", data.notificationType);
      //     }
      //   }
      // );
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated]);

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
      {/* Role-specific route groups - uses activeViewMode (not userType) for managers to default to resident view */}
      <Stack.Protected
        guard={
          isAuthenticated &&
          (activeViewMode === "resident" || activeViewMode === "no_access")
        }
      >
        <Stack.Screen name="(resident)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated && activeViewMode === "guard"}>
        <Stack.Screen name="(guard)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated && activeViewMode === "manager"}>
        <Stack.Screen name="(manager)" />
      </Stack.Protected>

      {/* Auth and entry screens */}
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
            <PortalProvider>
              <RootLayoutNavigator />
              <PortalHost name="global" />
            </PortalProvider>
            {/* @ts-expect-error - Custom toast config type doesn't match library's ToastConfig index signature */}
            <Toast position="top" config={toastConfig} topOffset={40} />
          </GestureHandlerRootView>
        </ResidenceProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default Layout;
