import React from "react";
import {
  TouchableOpacity,
  View,
  ImageSourcePropType,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";

interface ImageSquareButtonProps {
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  imageSize?: number;
  onPress: (event: GestureResponderEvent) => void;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  imageContainerClassName?: string;
}

const ImageButtonSmall: React.FC<ImageSquareButtonProps> = ({
  title,
  subtitle,
  image,
  imageSize = 30,
  onPress,
  backgroundColor,
  style,
  className,
  titleClassName,
  subtitleClassName,
  imageContainerClassName,
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`rounded-lg pr-2 pl-4 overflow-hidden h-[74px] border flex-row items-center justify-between ${className || ""}`}
      style={[
        {
          backgroundColor: backgroundColor || colors.cardBackground,
          width: "100%",
          borderColor: colors.lightBorder,
        },
        style,
      ]}
    >
      <View className="">
        <ThemedText
          className={`text-base font-uber-move-medium tracking-wide ${titleClassName || ""}`}
        >
          {title}
        </ThemedText>
        <ThemedTextSecondary
          className={`text-sm font-lato-regular ${subtitleClassName || ""}`}
        >
          {subtitle}
        </ThemedTextSecondary>
      </View>

      <View className={`mt-2 ${imageContainerClassName || ""}`}>
        <Image
          source={image}
          style={{
            width: imageSize,
            height: imageSize,
          }}
          contentFit="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

export default ImageButtonSmall;
