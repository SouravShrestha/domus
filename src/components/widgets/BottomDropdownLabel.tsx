import React from "react";
import { View } from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import ArrowIcon from "@icons/ArrowIcon";

interface BottomDropdownLabelProps {
  selectedOption: string;
}

const BottomDropdownLabel: React.FC<BottomDropdownLabelProps> = ({
  selectedOption,
}) => {
  const { currentTheme } = useTheme();
  const iconColor = themeColors[currentTheme]?.text || "#fff";

  return (
    <View
      className="flex-row items-center justify-start"
      style={{ gap: 8 }}
    >
      <ThemedText className="font-lato-regular text-[15px] tracking-wide">
        {selectedOption}
      </ThemedText>
      <View className="-rotate-90 self-end mt-0.5">
        <ArrowIcon width={18} height={18} stroke={iconColor} />
      </View>
    </View>
  );
};

export default BottomDropdownLabel;
