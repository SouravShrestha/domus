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
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";

interface ImageActionCardProps {
  label: string;
  image: ImageSourcePropType;
  imageSize?: number;
  imageBackgroundColor?: string;
  onPress: (event: GestureResponderEvent) => void;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  marginTop?: number;
}

const ImageActionCard: React.FC<ImageActionCardProps> = ({
  label,
  image,
  imageSize = 36,
  imageBackgroundColor,
  onPress,
  textColor,
  style,
  marginTop = 0,
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="rounded-lg overflow-hidden border mx-2.5"
      style={[
        {
          borderColor: colors.lightBorder,
          backgroundColor: colors.cardBackground,
          width: 100,
          height: 120,
        },
        style,
      ]}
    >
      <View className="flex-1 px-4 pt-4">
        <ThemedText
          className="text-base font-uber-move-medium leading-5 text-center"
          numberOfLines={2}
          style={{ color: textColor || colors.text }}
        >
          {label}
        </ThemedText>
      </View>

      <View
        className="items-center justify-end overflow-hidden"
        style={{
          height: 60,
        }}
      >
        <View
          className="absolute -bottom-1 w-full items-center left-2.5 right-2 w-20"
          style={{
            height: 36,
            backgroundColor:
              imageBackgroundColor + "30" || colors.accent + "30",
            borderTopLeftRadius: 9999,
            borderTopRightRadius: 9999,
          }}
        />
        <Image
          source={image}
          className="absolute"
          style={{
            width: imageSize,
            height: imageSize,
            bottom: marginTop || 0,
          }}
          contentFit="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

export default ImageActionCard;
