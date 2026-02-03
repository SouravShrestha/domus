import React from "react";
import { TouchableOpacity, ViewStyle, TextStyle, View } from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { CATEGORY_ICON_MAP, IconComponent, getCategoryColor } from "@/utils/categoryHelpers";

interface CategoryPillProps {
  label: string;
  value: string;
  isSelected: boolean;
  onPress: () => void;
  iconKey?: string;
  color?: string;
  icon?: IconComponent;
  iconSize?: number;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const CategoryPill: React.FC<CategoryPillProps> = ({
  label,
  value,
  isSelected,
  onPress,
  iconKey,
  color,
  icon: CustomIcon,
  iconSize = 12,
  containerStyle,
  textStyle,
}) => {
  const { themedColors } = useTheme();

  const iconConfig = iconKey ? CATEGORY_ICON_MAP[iconKey] : undefined;
  const IconComponent = CustomIcon || iconConfig?.icon;
  const resolvedColor = color || iconConfig?.color || getCategoryColor(value);

  return (
    <TouchableOpacity
      key={value}
      onPress={onPress}
      className="rounded-full flex-row px-3 py-1.5 mr-1.5 mb-2 border justify-center items-center"
      style={[
        {
          borderColor: isSelected ? resolvedColor : themedColors.border,
          backgroundColor: isSelected ? resolvedColor + "20" : "transparent",
        },
        containerStyle,
      ]}
    >
      {IconComponent && (
        <View className="mr-1">
          <IconComponent
            width={iconSize}
            height={iconSize}
            color={isSelected ? resolvedColor : themedColors.text}
          />
        </View>
      )}
      <ThemedText
        className="font-uber-move-medium text-sm"
        style={[
          {
            color: isSelected ? resolvedColor : themedColors.text,
            marginLeft: IconComponent ? 6 : 0,
          },
          textStyle,
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default CategoryPill;
