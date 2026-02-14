import React from "react";
import { TouchableOpacity, ViewStyle, TextStyle, View } from "react-native";
import { Image, ImageSource } from "expo-image";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import {
  createCategoryIconMap,
  createCategoryImageMap,
  IconComponent,
  getCategoryColor,
} from "@/utils/categoryHelpers";

interface CategoryPillProps {
  label: string;
  value: string;
  isSelected: boolean;
  onPress: () => void;
  iconKey?: string;
  imageKey?: string;
  image?: ImageSource;
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
  imageKey,
  image,
  color,
  icon: CustomIcon,
  iconSize = 12,
  containerStyle,
  textStyle,
}) => {
  const { themedColors, currentTheme } = useTheme();

  const categoryIconMap = createCategoryIconMap(currentTheme);
  const iconConfig = iconKey ? categoryIconMap[iconKey] : undefined;
  const IconComponent = CustomIcon || iconConfig?.icon;
  const resolvedColor =
    color || iconConfig?.color || getCategoryColor(value, currentTheme);
  const categoryImageMap = createCategoryImageMap(currentTheme);
  const imageConfig = imageKey ? categoryImageMap[imageKey] : undefined;
  const resolvedImage = image || imageConfig?.source;
  const resolvedImageSize = imageConfig?.imageSize ?? iconSize + 4;

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
      {resolvedImage ? (
        <Image
          source={resolvedImage}
          style={{ width: resolvedImageSize, height: resolvedImageSize }}
          contentFit="contain"
        />
      ) : IconComponent ? (
        <View className="mr-1">
          <IconComponent
            width={iconSize}
            height={iconSize}
            color={isSelected ? resolvedColor : themedColors.text}
          />
        </View>
      ) : null}
      <ThemedText
        className="font-uber-move-medium text-sm"
        style={[
          {
            color: isSelected ? resolvedColor : themedColors.text,
            marginLeft: resolvedImage || IconComponent ? 6 : 0,
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
