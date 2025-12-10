import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { pushTokenRepository } from "@repositories/notification/pushToken.repository";
import { supabase_client } from "@api/client";
import { PushTokenCreate } from "@models/pushToken";

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications and store the token in Supabase
 * @returns The Expo push token or null if registration failed
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  try {
    // Check existing permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission not granted");
      return null;
    }

    // Get the project ID for Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.error("Missing EAS project ID in app.config.js");
      return null;
    }

    // Get the Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenData.data;

    console.log("Expo push token:", token);

    // Store the token in Supabase
    await savePushTokenToSupabase(token);

    // Configure Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0062E3",
      });
    }

    return token;
  } catch (error) {
    console.error("Error registering for push notifications:", error);
    return null;
  }
}

/**
 * Save the push token to Supabase for the current user
 */
async function savePushTokenToSupabase(token: string): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase_client.auth.getUser();

    if (!user?.id) {
      console.log("No authenticated user, skipping push token save");
      return;
    }

    const tokenData: PushTokenCreate = {
      user_id: user.id,
      expo_push_token: token,
      device_id: Device.modelId ?? undefined,
      platform: Platform.OS as "ios" | "android" | "web",
    };

    const { error } = await pushTokenRepository.upsert(tokenData);

    if (error) {
      console.error("Error saving push token to Supabase:", error);
    } else {
      console.log("Push token saved to Supabase successfully");
    }
  } catch (error) {
    console.error("Error saving push token:", error);
  }
}

/**
 * Remove the current device's push token from Supabase (e.g., on logout)
 */
export async function unregisterPushToken(): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase_client.auth.getUser();

    if (!user?.id) return;

    // Get current token to remove
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    const { error } = await pushTokenRepository.delete(user.id, token);

    if (error) {
      console.error("Error removing push token:", error);
    } else {
      console.log("Push token removed successfully");
    }
  } catch (error) {
    console.error("Error unregistering push token:", error);
  }
}

/**
 * Add a listener for when a notification is received while app is foregrounded
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add a listener for when user interacts with a notification
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get the last notification response (for handling app launch from notification)
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return Notifications.getLastNotificationResponseAsync();
}
