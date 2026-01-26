import React from "react";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";

interface IconPillButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  selectedColor?: string;
  selectedTextColor?: string;
  unselectedColor?: string;
  unselectedTextColor?: string;
  unselectedBorderColor?: string;
}

const IconPillButton: React.FC<IconPillButtonProps> = ({
  label,
  isSelected,
  onPress,
  icon,
  selectedColor,
  selectedTextColor,
  unselectedColor,
  unselectedTextColor,
  unselectedBorderColor,
}) => {
  const { themedColors } = useTheme();

  const backgroundColor = isSelected
    ? selectedColor || themedColors.accent
    : unselectedColor || themedColors.cardBackground;

  const textColor = isSelected
    ? selectedTextColor || themedColors.textOnAccent
    : unselectedTextColor || themedColors.text;

  const borderColor = isSelected
    ? selectedColor || themedColors.accent
    : unselectedBorderColor || themedColors.lightBorder;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-full flex-row items-center justify-center px-4 py-1.5"
      style={{
        backgroundColor,
        borderWidth: 1,
        borderColor,
      }}
    >
      {icon && <View className="mr-2">{icon}</View>}
      <ThemedText
        className="text-sm font-lato-medium"
        style={{ color: textColor }}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default IconPillButton;
