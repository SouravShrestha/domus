import React from "react";
import { TouchableOpacity, GestureResponderEvent } from "react-native";
import { ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import TrendIcon from "@icons/TrendIcon";

interface TopSearchItemProps {
  label: string;
  index: number;
  onPress?: (event: GestureResponderEvent) => void;
}

const TopSearchItem: React.FC<TopSearchItemProps> = ({ label, index, onPress }) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  return (
    <TouchableOpacity
      key={index}
      className="rounded-md flex-row space-x-2 items-center justify-start py-1.5 px-3.5 border mb-2"
      style={{ borderColor: colors.border }}
      onPress={onPress}
    >
      <TrendIcon width={16} height={16} color={colors.secondaryText} />
      <ThemedTextSecondary className="font-lato-regular text-base">
        {label}
      </ThemedTextSecondary>
    </TouchableOpacity>
  );
};

export default TopSearchItem;