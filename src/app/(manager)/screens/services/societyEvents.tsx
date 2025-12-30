import React from "react";
import { View, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, ThemedTextSecondary, ThemedView } from "@themes/themedComponents";
import { router } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { CalendarIcon } from "@/components/icons";
import { useTheme } from "@/contexts/themeContext";

const ManagerSocietyEventsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { themedColors } = useTheme();

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <View style={{ marginTop: insets.top }} className="flex-1">
        <View className="px-4">
          <ThemedHeaderWithBack
            onBackPress={() => router.back()}
            title="society events"
          />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: themedColors.cardBackground }}
          >
            <CalendarIcon
              width={36}
              height={36}
              color={themedColors.accent}
            />
          </View>
          <ThemedText className="text-xl font-uber-move-medium text-center mb-2">
            Society Events
          </ThemedText>
          <ThemedTextSecondary className="text-sm font-lato-regular text-center">
            Create and manage society events
          </ThemedTextSecondary>
        </View>
      </View>
    </ThemedView>
  );
};

export default ManagerSocietyEventsScreen;
