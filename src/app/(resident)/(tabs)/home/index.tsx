import React, { useRef, useState, useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ThemedView,
  ThemedScrollView,
  ThemedStatusBar,
} from "@themes/themedComponents";
import ResidenceSwitcher, {
  ResidenceSwitcherSheet,
  ResidenceSwitcherSheetRef,
} from "@components/widgets/ResidenceSwitcher";
import { Portal } from "@gorhom/portal";
import { BellIcon } from "@/components/icons";
import { useTheme } from "@/contexts/themeContext";
import { router, useFocusEffect } from "expo-router";
import { notificationService } from "@/api/services/notification.service";
import { ProfileIcon } from "@components/widgets/ProfileIcon";
import { userService } from "@/api/services/user.service";
import { getUserDisplayName } from "@/utils/textHelpers";
import { UserProfile } from "@/types/models/user";

const Home: React.FC = () => {
  const residenceSwitcherSheetRef = useRef<ResidenceSwitcherSheetRef>(null);
  const { themedColors } = useTheme();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchUnreadCount = React.useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await userService.getCurrentUser();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadCount();
      fetchProfile();
    }, [fetchUnreadCount, fetchProfile])
  );

  const handleOpenResidenceSwitcher = () => {
    residenceSwitcherSheetRef.current?.open();
  };

  const handleOpenNotifications = () => {
    router.push("/(resident)/screens/notifications/notificationsScreen");
  };

  const handleOpenProfile = () => {
    router.push("/(resident)/screens/profile/profileScreen");
  };

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <ThemedScrollView className="flex-1">
          <View className="px-4 py-3 flex-row items-center justify-between">
            <ResidenceSwitcher onPress={handleOpenResidenceSwitcher} />
            <View className="flex-row items-center" style={{ gap: 24 }}>
              <TouchableOpacity onPress={handleOpenNotifications} hitSlop={10}>
                <BellIcon
                  width={20}
                  height={20}
                  color={themedColors.text}
                  notificationCount={unreadCount}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleOpenProfile} hitSlop={10}>
                <ProfileIcon
                  username={getUserDisplayName(profile)}
                  avatarUrl={profile?.photo_url}
                  size={32}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ThemedScrollView>
      </SafeAreaView>
      <Portal name="global">
        <ResidenceSwitcherSheet ref={residenceSwitcherSheetRef} />
      </Portal>
    </ThemedView>
  );
};

export default Home;
