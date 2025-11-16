import React from "react";
import { TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle } from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";

interface WideButtonProps extends TouchableOpacityProps {
  onPress?: () => void;
  label: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  textClassName?: string;
}

const WideButton: React.FC<WideButtonProps> = ({
  onPress,
  label,
  className = "",
  style,
  textClassName = "text-base font-uber-move-medium tracking-wide",
  ...props
}) => {
  const { themedColors } = useTheme();
  const borderColor = themedColors.border;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`p-4 rounded-lg items-center border-[1px] ${className}`}
      style={[{ borderColor: themedColors.border }, style]}
      accessibilityRole="button"
      {...props}
    >
      <ThemedText className={textClassName} style={{ color: themedColors.text }}>{label}</ThemedText>
    </TouchableOpacity>
  );
};

export default WideButton;
