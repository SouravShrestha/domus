import React from "react";
import { View, Text } from "react-native";
import { ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { FilledHeartIcon } from "@components/icons";
import basicColors from "@themes/colors";

interface AppFooterProps {
  appVersion?: string;
}

const AppFooter: React.FC<AppFooterProps> = ({ appVersion = "1.1.2.0" }) => {
  const { themedColors } = useTheme();

  return (
    <View className="px-2">
      <Text
        className="text-4xl font-lato-black tracking-wider text-left"
        style={{ color: themedColors.disabled }}
      >
        TRULY
      </Text>
      <Text
        className="text-4xl font-lato-black tracking-wider text-left mt-1"
        style={{ color: themedColors.disabled }}
      >
        INDIAN
      </Text>
      <Text
        className="text-4xl font-lato-black tracking-wider text-left mt-1"
        style={{ color: themedColors.disabled }}
      >
        APP
      </Text>
      <View className="flex-row mt-4 items-center">
        <ThemedTextSecondary className="text-sm font-lato-regular tracking-wider text-left mr-1.5 uppercase">
          Crafted with
        </ThemedTextSecondary>
        <FilledHeartIcon width={16} height={16} color={basicColors.red} />
        <ThemedTextSecondary className="text-sm font-lato-regular tracking-wider text-left ml-1.5 uppercase">
          in India
        </ThemedTextSecondary>
      </View>
      <ThemedTextSecondary className="text-xs font-lato-regular tracking-wider text-left uppercase mt-3">
        App version {appVersion}
      </ThemedTextSecondary>
    </View>
  );
};

export default AppFooter;
