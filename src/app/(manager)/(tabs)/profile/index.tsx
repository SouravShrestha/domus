import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useAuth } from "@contexts/authContext";
import ProfileIcon from "@components/icons/ProfileIcon";
import LogoutIcon from "@components/icons/LogoutIcon";
import SwapIcon from "@components/icons/SwapIcon";
import { ROUTES } from "@constants/routes";

const ManagerProfileScreen: React.FC = () => {
  const { themedColors } = useTheme();
  const { profile, signOut, switchViewMode } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleSwitchToResident = () => {
    // Switch view mode and navigate to resident home
    switchViewMode("resident");
    router.replace(ROUTES.RESIDENT.HOME);
  };

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <View className="px-4 py-3">
          <ThemedText className="text-2xl font-uber-move-medium">
            Account
          </ThemedText>
        </View>

        {/* Profile Card */}
        <View
          className="mx-4 p-4 rounded-xl mb-4"
          style={{ backgroundColor: themedColors.card }}
        >
          <View className="flex-row items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: themedColors.accent + "20" }}
            >
              <ProfileIcon
                width={32}
                height={32}
                color={themedColors.accent}
              />
            </View>
            <View className="flex-1">
              <ThemedText className="text-lg font-uber-move-medium">
                {profile?.name || "Manager"}
              </ThemedText>
              <Text
                className="text-sm font-lato-regular mt-1"
                style={{ color: themedColors.secondaryText }}
              >
                {profile?.phone || ""}
              </Text>
              <View
                className="self-start px-2 py-1 rounded mt-2"
                style={{ backgroundColor: themedColors.accent + "20" }}
              >
                <Text
                  className="text-xs font-uber-move-medium"
                  style={{ color: themedColors.accent }}
                >
                  Society Manager
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Switch to Resident Mode - Always available for managers */}
        <TouchableOpacity
          onPress={handleSwitchToResident}
          className="mx-4 mb-4 p-4 rounded-xl flex-row items-center"
          style={{ backgroundColor: themedColors.card }}
          activeOpacity={0.7}
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: themedColors.accent + "20" }}
          >
            <SwapIcon width={20} height={20} color={themedColors.accent} />
          </View>
          <View className="flex-1">
            <ThemedText className="text-base font-uber-move-medium">
              Switch to Resident Mode
            </ThemedText>
            <Text
              className="text-xs font-lato-regular mt-1"
              style={{ color: themedColors.secondaryText }}
            >
              Access resident features
            </Text>
          </View>
        </TouchableOpacity>

        {/* Sign Out Button */}
        <View className="flex-1" />
        <TouchableOpacity
          onPress={handleSignOut}
          className="mx-4 mb-4 p-4 rounded-xl flex-row items-center justify-center"
          style={{ backgroundColor: themedColors.error + "15" }}
          activeOpacity={0.7}
        >
          <LogoutIcon width={20} height={20} color={themedColors.error} />
          <Text
            className="text-base font-uber-move-medium ml-2"
            style={{ color: themedColors.error }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ThemedView>
  );
};

export default ManagerProfileScreen;

