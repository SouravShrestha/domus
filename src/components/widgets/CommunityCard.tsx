import React from "react";
import {
  TouchableOpacity,
  View,
  Image,
  ImageSourcePropType,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";

interface CommunityCardProps {
  label: string;
  image: ImageSourcePropType;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  label,
  image,
  onPress,
  style,
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="overflow-hidden items-center justify-center py-4"
      style={[style]}
    >
      <View
        className="items-center justify-center mb-2 border rounded-md"
        style={{ height: 64, width: 64, borderColor: colors.lightBorder }}
      >
        <Image
          source={image}
          style={{
            width: 32,
            height: 32,
            resizeMode: "contain",
          }}
        />
      </View>
      <ThemedText
        className="text-sm font-uber-move-medium text-center leading-5"
        numberOfLines={2}
        style={{ color: colors.text }}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default CommunityCard;
