import React from "react";
import { Text, TouchableOpacity, View, StyleProp, TextStyle, ViewStyle } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";

interface ThemeActionButtonProps {
  icon: React.ComponentType<{ width?: number; height?: number; color?: string }>;
  label: string;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  isActive?: boolean;
}

const ThemeActionButton: React.FC<ThemeActionButtonProps> = ({
  icon: Icon,
  label,
  onPress,
  backgroundColor,
  textColor,
  isActive = false,
}) => {
  const { currentTheme } = useTheme();
  const iconSize = 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="items-start pt-4 pb-3 rounded-md w-full h-28 pr-1 pl-3 justify-between"
      style={{
        backgroundColor: backgroundColor,
        borderBottomWidth: 5,
        borderColor: isActive ? themeColors[currentTheme]?.accent : "transparent",
      }}
    >
      <View className="flex items-center justify-center">
        <Icon width={iconSize} height={iconSize} color={textColor || themeColors[currentTheme]?.text} />
      </View>
      <Text
        className="text-start font-uber-move-medium tracking-wide leading-5"
        numberOfLines={2}
        style={{ fontSize: 16, color: textColor || themeColors[currentTheme]?.text }}
      >
        {label.replace(" ", "\n")}
      </Text>
    </TouchableOpacity>
  );
};

export default ThemeActionButton;
