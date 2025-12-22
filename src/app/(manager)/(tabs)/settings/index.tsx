import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ThemedView,
  ThemedText,
  ThemedTextSecondary,
  ThemedStatusBar,
} from "@themes/themedComponents";

const SettingsScreen: React.FC = () => {
  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <ThemedText className="text-2xl font-uber-move-bold tracking-wide mb-2">
            Settings
          </ThemedText>
          <ThemedTextSecondary className="text-base font-lato-regular text-center">
            Society settings and configurations coming soon.
          </ThemedTextSecondary>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default SettingsScreen;
