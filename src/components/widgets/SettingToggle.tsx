import React from "react";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import CustomToggle from "./CustomToggle";

interface SettingToggleProps {
  label: string;
  value: boolean;
  onValueChange?: (value: boolean) => void;
  Icon: React.ComponentType<{
    width?: number;
    height?: number;
    color?: string;
    className?: string;
  }>;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  label,
  value,
  onValueChange,
  Icon,
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  const iconColor = colors?.text || "#fff";
  const size = 15;

  return (
    <TouchableOpacity onPress={() => onValueChange(!value)}>
      <View className="flex-row justify-between items-center py-2 px-10 -mx-10">
        <View className="flex-row items-center">
          <Icon className="mr-6" width={size} height={size} color={iconColor} />
          <ThemedText className="text-base font-uber-move-medium tracking-wide ml-4">
            {label}
          </ThemedText>
        </View>

        <CustomToggle value={value} onValueChange={onValueChange} />
      </View>
    </TouchableOpacity>
  );
};

export default SettingToggle;
