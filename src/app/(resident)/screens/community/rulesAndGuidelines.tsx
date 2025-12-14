import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, ThemedView } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { themeColors } from "@themes/colors";

const RulesAndGuidelinesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  return (
    <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>
      <View className="flex-1 items-center justify-center px-6">
        <ThemedText className="text-2xl font-uber-move-medium text-center mb-4">
          📋 Rules & Guidelines
        </ThemedText>
        <ThemedText
          className="text-base text-center"
          style={{ color: colors.secondaryText }}
        >
          Coming Soon
        </ThemedText>
      </View>
    </ThemedView>
  );
};

export default RulesAndGuidelinesScreen;
