import React from "react";
import { View, ViewStyle, TextStyle } from "react-native";
import { ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { InfoIcon } from "@/components/icons";
import { createCategoryIconMap, IconComponent } from "@/utils/categoryHelpers";

interface IconTagPillProps {
  iconKey?: string;
  label: string;
  icon?: IconComponent;
  iconColor?: string;
  iconSize?: number;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  backgroundColor?: string;
  isLarge?: boolean;
}

const IconTagPill: React.FC<IconTagPillProps> = ({
  iconKey,
  label,
  icon: CustomIcon,
  iconColor,
  iconSize,
  containerStyle,
  textStyle,
  backgroundColor,
  isLarge = false,
}) => {
  const { themedColors, currentTheme } = useTheme();

  const categoryIconMap = createCategoryIconMap(currentTheme);
  const iconConfig = iconKey ? categoryIconMap[iconKey] : undefined;
  const IconComponent = CustomIcon || iconConfig?.icon || InfoIcon;
  const resolvedIconColor =
    iconColor || iconConfig?.color || themedColors.secondaryText;
  const resolvedBackgroundColor = backgroundColor || `${resolvedIconColor}15`;

  const resolvedIconSize = iconSize || (isLarge ? 14 : 10);
  const paddingClass = isLarge ? "px-3 py-1.5" : "px-2.5 py-1";
  const textSizeClass = isLarge ? "text-sm" : "text-xs";

  return (
    <View
      className={`flex-row items-center ${paddingClass} rounded-full`}
      style={[{ backgroundColor: resolvedBackgroundColor }, containerStyle]}
    >
      <IconComponent
        width={resolvedIconSize}
        height={resolvedIconSize}
        color={resolvedIconColor}
      />
      <ThemedTextSecondary
        className={`${textSizeClass} font-uber-move-medium ml-1.5 tracking-wide`}
        style={[{ color: resolvedIconColor }, textStyle]}
      >
        {label}
      </ThemedTextSecondary>
    </View>
  );
};

export default IconTagPill;
