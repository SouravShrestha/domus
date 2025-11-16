import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import CircleHalfIcon from "@icons/CircleHalfIcon";
import { useTheme } from "@/contexts/themeContext";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}

interface QuickActionsProps {
  action: QuickAction;
  onPress: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ action, onPress }) => {

  const { themedColors } = useTheme();
  const frontColor = themedColors.text;
  const backColor = themedColors.accent;

  return (
    <View className="w-full">
      <TouchableOpacity
        className="flex items-center justify-start rounded-md flex-row overflow-hidden"
        style={{ backgroundColor: themedColors.cardBackground, height: 64 }}
        onPress={onPress}
      >
        <View className="rotate-180 absolute" style={{ marginLeft: -40 }}>
          <CircleHalfIcon
            width={64}
            height={64}
            color={backColor + "30"}
          />
        </View>
        <View className="" style={{ marginLeft: 10, marginRight: 16 }}>{action.icon}</View>
        <Text
          className="font-uber-move-medium text-left text-sm tracking-wide"
          style={{ color: frontColor }}
        >
          {action.label}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default QuickActions;