import React from "react";
import {
  View,
} from "react-native";
import { ThemedText } from "@themes/themedComponents";
import ThemeActionButton from "./ThemeActionButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";

interface ThemeOption {
  value: string;
  icon: React.ComponentType<{
    width?: number;
    height?: number;
    color?: string;
  }>;
  label: string;
  backgroundColor?: string;
  textColor?: string;
}

interface ThemeModalProps {
  onClose: () => void;
  themeOptions: ThemeOption[];
  onThemeChange: (value: string) => void;
}

const ThemeModal: React.FC<ThemeModalProps> = ({
  onClose,
  themeOptions,
  onThemeChange,
}) => {
  const { currentTheme, selectedTheme } = useTheme();
  const colors = themeColors[currentTheme];
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 px-5 w-full"
      style={{
        backgroundColor: colors.modal,
        marginBottom: insets.bottom,
        marginTop: 14,
      }}
    >
      <View className="flex-row justify-start items-center mb-7 pr-1 pl-1">
        <ThemedText className="text-[19px] font-uber-move-medium tracking-wide">
          Choose your theme
        </ThemedText>
      </View>

      <View className="-mx-2 flex-row items-center">
        {themeOptions.map((option) => (
          <View className="flex-1 px-2 relative" key={option.value}>
            <ThemeActionButton
              icon={option.icon}
              label={option.label}
              backgroundColor={option.backgroundColor}
              textColor={option.textColor}
              isActive={selectedTheme === option.value}
              onPress={() => onThemeChange(option.value)}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default ThemeModal;
