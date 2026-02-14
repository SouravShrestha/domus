import React from "react";
import {
  TouchableOpacity,
  View,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Image, ImageSource } from "expo-image";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";

interface ImageSquareButtonProps {
  title: string;
  subtitle: string;
  image: ImageSource;
  imageSize?: number;
  onPress: (event: GestureResponderEvent) => void;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

const ImageButton: React.FC<ImageSquareButtonProps> = ({
  title,
  subtitle,
  image,
  imageSize = 120,
  onPress,
  backgroundColor,
  style,
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="rounded-lg p-4 overflow-hidden h-40 border"
      style={[
        {
          backgroundColor: backgroundColor || colors.cardBackground,
          width: "100%",
          borderColor: colors.lightBorder,
        },
        style,
      ]}
    >
      <View className="flex-1 w-2/3">
        <ThemedText className="text-lg font-uber-move-medium tracking-wide">
          {title}
        </ThemedText>
        <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide mt-1">
          {subtitle}
        </ThemedTextSecondary>
      </View>

      <View className="absolute -bottom-1 right-0">
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

export default ImageButton;
