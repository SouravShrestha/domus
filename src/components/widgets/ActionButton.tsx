import React from "react";
import { TouchableOpacity, View, GestureResponderEvent, StyleProp, ViewStyle } from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";

interface ActionButtonProps {
  icon: React.ComponentType<{ width?: number; height?: number; color?: string }>;
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  iconBackgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  onPress,
  backgroundColor,
  textColor,
  iconColor,
  iconBackgroundColor,
  style,
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="items-start py-3 rounded-[11px] w-[142px] h-[108px] mr-4 pr-2 pl-3.5 justify-between"
      style={[{ backgroundColor: backgroundColor || colors.mainCardBackground }, style]}
    >
      <View
        className="flex items-center justify-center p-2 rounded-full"
        style={{ backgroundColor: iconBackgroundColor || colors.accent }}
      >
        <Icon width={15} height={15} color={iconColor || colors.mainCardBackground} />
      </View>
      <ThemedText
        className="text-start font-uber-move-medium tracking-wider leading-5"
        numberOfLines={2}
        style={{ fontSize: 16, color: textColor || colors.textOnCardBackground }}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default ActionButton;
