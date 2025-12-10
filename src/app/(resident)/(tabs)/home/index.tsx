import React, { useRef } from "react";
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

const Home: React.FC = () => {
  const residenceSwitcherSheetRef = useRef<ResidenceSwitcherSheetRef>(null);
  const { themedColors } = useTheme();
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchUnreadCount = React.useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadCount();
    }, [fetchUnreadCount])
  );

  const handleOpenResidenceSwitcher = () => {
    residenceSwitcherSheetRef.current?.open();
  };

  const handleOpenNotifications = () => {
    router.push("/(resident)/screens/notifications/notificationsScreen");
  };

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <ThemedScrollView className="flex-1">
          <View className="px-4 py-3 flex-row items-center justify-between">
            <ResidenceSwitcher onPress={handleOpenResidenceSwitcher} />
            <TouchableOpacity
              onPress={handleOpenNotifications}
              className="mr-2"
              hitSlop={10}
            >
              <BellIcon
                width={20}
                height={20}
                color={themedColors.text}
                notificationCount={unreadCount}
              />
            </TouchableOpacity>
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
