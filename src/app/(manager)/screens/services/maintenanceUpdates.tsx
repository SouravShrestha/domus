import React from "react";
import { View, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, ThemedTextSecondary, ThemedView } from "@themes/themedComponents";
import { router } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { MaintenanceIcon } from "@/components/icons";
import { useTheme } from "@/contexts/themeContext";

const ManagerMaintenanceUpdatesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { themedColors } = useTheme();

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <View style={{ marginTop: insets.top }} className="flex-1">
        <View className="px-4">
          <ThemedHeaderWithBack
            onBackPress={() => router.back()}
            title="maintenance updates"
          />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: themedColors.cardBackground }}
          >
            <MaintenanceIcon
              width={36}
              height={36}
              color={themedColors.accent}
            />
          </View>
          <ThemedText className="text-xl font-uber-move-medium text-center mb-2">
            Maintenance Updates
          </ThemedText>
          <ThemedTextSecondary className="text-sm font-lato-regular text-center">
            Post and manage maintenance updates for the society
          </ThemedTextSecondary>
        </View>
      </View>
    </ThemedView>
  );
};

export default ManagerMaintenanceUpdatesScreen;
