import React from "react";
import {
  TouchableOpacity,
  View,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Image, ImageSource } from "expo-image";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import ArrowIcon from "@icons/ArrowIcon";

interface HelpSecurityCardProps {
  label: string;
  image: ImageSource;
  imageSize?: number;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

const HelpSecurityCard: React.FC<HelpSecurityCardProps> = ({
  label,
  image,
  imageSize = 28,
  onPress,
  style,
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center pl-1 pr-3 py-1 rounded-lg border"
      style={[
        {
          borderColor: colors.lightBorder,
          flex: 1,
          backgroundColor: colors.cardBackground,
        },
        style,
      ]}
    >
      <Image
        source={image}
        style={{
          width: imageSize,
          height: imageSize,
        }}
        contentFit="contain"
      />
      <ThemedText
        className="flex-1 ml-2 text-sm font-uber-move-medium"
        numberOfLines={2}
        style={{ color: colors.text }}
      >
        {label}
      </ThemedText>
      <View style={{ transform: [{ scaleX: -1 }] }}>
        <ArrowIcon width={16} height={16} stroke={colors.secondaryText} />
      </View>
    </TouchableOpacity>
  );
};

export default HelpSecurityCard;
