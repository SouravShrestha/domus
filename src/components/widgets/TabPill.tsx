import React from "react";
import { TouchableOpacity } from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";

interface TabPillProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  className?: string;
}

const TabPill: React.FC<TabPillProps> = ({
  label,
  isSelected,
  onPress,
  icon,
  className = "",
}) => {
  const { themedColors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-full px-4 mr-3 py-1.5 border flex-row items-center justify-center ${className}`}
      style={{
        borderColor: isSelected
          ? themedColors.accent
          : themedColors.lightBorder,
        backgroundColor: isSelected
          ? themedColors.accent + "20"
          : "transparent",
      }}
    >
      {icon}
      <ThemedText
        className="text-sm font-uber-move-medium tracking-wide ml-2"
        style={{
          color: isSelected ? themedColors.accent : themedColors.text,
        }}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default TabPill;
