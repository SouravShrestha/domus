import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Portal } from "@gorhom/portal";
import { ThemedView, ThemedText } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useAuth } from "@contexts/authContext";
import { getUserDisplayName } from "@/utils/textHelpers";
import { getActiveGuardAssignments } from "@api/services/guard.service";
import { GuardAssignmentWithSociety } from "@/types/models/guard";

import { CheckCircleIcon, RefreshIcon, LogoutIcon } from "@/components/icons";
import { ProfileIcon } from "@components/widgets/ProfileIcon";
import SocietySwitcher, {
  SocietySwitcherSheet,
  SocietySwitcherSheetRef,
} from "@components/widgets/SocietySwitcher";
import basicColors from "@/themes/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import AppFooter from "@/components/widgets/AppFooter";
import { ROUTES } from "@/constants/routes";

const GuardHome: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { user, profile, switchViewMode, isResident, signOut } = useAuth();
  const societySwitcherSheetRef = useRef<SocietySwitcherSheetRef>(null);
  const insets = useSafeAreaInsets();

  const [assignments, setAssignments] = useState<GuardAssignmentWithSociety[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const { data, error } = await getActiveGuardAssignments(user?.id || "");
        if (!error && data) {
          setAssignments(data);
        }
      } catch (error) {
        console.error("Error fetching guard data:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [fetchData, user?.id]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleOpenSocietySwitcher = () => {
    societySwitcherSheetRef.current?.open();
  };

  const handleProfile = () => {
    router.push(ROUTES.GUARD.SCREENS.PROFILE);
  };

  const handleSwitchToResident = () => {
    switchViewMode("resident");
    router.replace(ROUTES.RESIDENT.HOME);
  };

  if (isLoading) {
    return (
      <ThemedView className="flex-1">
        <LoadingOverlay currentTheme={currentTheme} />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <ScrollView
        className="flex-1"
        style={{ marginTop: insets.top }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={themedColors.accent}
          />
        }
      >
        <View className="px-6 py-3 flex-row items-center justify-between">
          <SocietySwitcher onPress={handleOpenSocietySwitcher} />
          <View className="flex-row items-center" style={{ gap: 24 }}>
            <TouchableOpacity onPress={handleProfile} hitSlop={10}>
              <ProfileIcon
                username={getUserDisplayName(profile)}
                avatarUrl={profile?.photo_url}
                size={32}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 mt-8">
          <ThemedText className="text-2xl font-uber-move-medium tracking-wide">
            Welcome, {getUserDisplayName(profile)}
          </ThemedText>
          <Text
            className="text-base font-lato-regular mt-2"
            style={{ color: themedColors.secondaryText }}
          >
            You are logged in as a security guard
          </Text>
        </View>

        {/* Current Assignment Section */}
        <View className="mt-8 px-6">
          <ThemedText className="text-xl font-uber-move-medium tracking-wide mb-4">
            Current Status
          </ThemedText>

          <View
            className="p-4 rounded-lg"
            style={{ backgroundColor: themedColors.cardBackground }}
          >
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: basicColors.brightGreen + "20" }}
              >
                <CheckCircleIcon
                  width={24}
                  height={24}
                  color={basicColors.brightGreen}
                />
              </View>
              <View className="flex-1">
                <ThemedText className="text-base font-uber-move-medium">
                  On Duty
                </ThemedText>
                <Text
                  className="text-sm font-lato-regular mt-1"
                  style={{ color: themedColors.secondaryText }}
                >
                  {assignments.length > 0
                    ? `${assignments[0].society.name}`
                    : "No active assignment"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Switch Mode Section */}
        {isResident && (
          <View className="mt-8 px-6">
            <TouchableOpacity
              onPress={handleSwitchToResident}
              className="flex-row items-center p-4 rounded-lg"
              style={{ backgroundColor: themedColors.cardBackground }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: basicColors.blue + "20" }}
              >
                <RefreshIcon width={20} height={20} color={basicColors.blue} />
              </View>
              <View className="flex-1">
                <ThemedText className="text-base font-uber-move-medium">
                  Switch to Resident Mode
                </ThemedText>
                <Text
                  className="text-sm font-lato-regular mt-0.5"
                  style={{ color: themedColors.secondaryText }}
                >
                  Access your residence features
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Section */}
        <View className="mt-8 px-6">
          <TouchableOpacity
            onPress={signOut}
            className="flex-row items-center p-4 rounded-lg border"
            style={{
              backgroundColor: "transparent",
              borderColor: themedColors.border,
            }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: basicColors.red + "10" }}
            >
              <LogoutIcon width={20} height={20} color={basicColors.red} />
            </View>
            <View className="flex-1">
              <ThemedText className="text-base font-uber-move-medium">
                Log Out
              </ThemedText>
              <Text
                className="text-sm font-lato-regular mt-0.5"
                style={{ color: themedColors.secondaryText }}
              >
                Sign out of your account
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-auto mb-12 px-5 items-start pt-12">
          <AppFooter />
        </View>
      </ScrollView>
      <Portal name="global">
        <SocietySwitcherSheet ref={societySwitcherSheetRef} />
      </Portal>
    </ThemedView>
  );
};

export default GuardHome;
