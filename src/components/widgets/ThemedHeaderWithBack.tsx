import React from "react";
import { View, TouchableOpacity, GestureResponderEvent, StyleProp, TextStyle } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import { ThemedText } from "@themes/themedComponents";
import ArrowIcon from "@icons/ArrowIcon";

interface ThemedHeaderWithBackProps {
  onBackPress?: (event: GestureResponderEvent) => void;
  title: string;
  titleStyle?: object & StyleProp<TextStyle>;
}

const ThemedHeaderWithBack: React.FC<ThemedHeaderWithBackProps> = ({
  onBackPress,
  title,
  titleStyle,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const colors: any = themeColors[currentTheme] || {};

  return (
    <View className="flex-row items-center" {...props}>
      <TouchableOpacity
        onPress={onBackPress}
        className="mr-2 w-10 h-9 items-center justify-center"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ArrowIcon width={32} height={32} stroke={colors.text} />
      </TouchableOpacity>
      <ThemedText className="text-4xl font-uber-move-medium tracking-wide" style={titleStyle}>
        {title}
      </ThemedText>
    </View>
  );
};

export default ThemedHeaderWithBack;
