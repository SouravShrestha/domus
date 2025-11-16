import React, { ComponentType, ReactNode } from "react";
import { TouchableOpacity, View, TouchableOpacityProps, StyleProp, ViewStyle } from "react-native";
import ArrowIcon from "@icons/ArrowIcon";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";

interface ListItemButtonProps extends TouchableOpacityProps {
  Icon?: ComponentType<{ width?: number; height?: number; color?: string }>;
  label: string;
  onPress?: () => void;
  RightIcon?: ComponentType<{ width?: number; height?: number; color?: string; stroke?: string }>;
  style?: StyleProp<ViewStyle>;
  labelClassName?: string;
  mirrorRightIcon?: boolean;
  Left?: ReactNode;
}

export default function ListItemButton({
  Icon,
  label,
  onPress,
  RightIcon = ArrowIcon,
  style,
  labelClassName = "text-base font-uber-move-regular tracking-wide",
  mirrorRightIcon = true,
  Left,
  ...props
}: ListItemButtonProps) {
  const { currentTheme } = useTheme();
  const iconColor = themeColors[currentTheme]?.text || "#fff";
  const size = 16;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      className="flex-row items-center justify-between py-3 px-10 -mx-10"
      onPress={onPress}
      style={style}
      {...props}
    >
      <View className="flex-row items-center" style={{ gap: 12 }}>
        {Left ? Left : Icon ? (
          <Icon width={size} height={size} color={iconColor} />
        ) : null}
        <ThemedText className={labelClassName}>{label}</ThemedText>
      </View>
      <View style={mirrorRightIcon ? { transform: [{ scaleX: -1 }] } : undefined}>
        <RightIcon
          width={18}
          height={18}
          color={iconColor}
          stroke={iconColor}
        />
      </View>
    </TouchableOpacity>
  );
}
