import React from "react";
import { View, Text, TouchableOpacity, StyleProp, TextStyle, ViewStyle } from "react-native";
import SearchIcon from "@icons/SearchIcon";
import { themeColors } from "@themes/colors";
import { useTheme } from "@/contexts/themeContext";

interface SearchBarButtonProps {
  prompt: string;
  style?: StyleProp<TextStyle>;
  onPress?: () => void;
  isActive?: boolean;
}

const SearchBarButton: React.FC<SearchBarButtonProps> = ({
  prompt,
  style,
  onPress,
  isActive = false,
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        className="py-3 px-4 rounded-full flex-row items-center border"
        style={{
          backgroundColor: colors.inputBackground,
          borderColor: colors.border,
        }}
      >
        <View pointerEvents="none">
          <SearchIcon
            width={20}
            height={20}
            color={isActive ? colors.text : colors.placeholderText}
          />
        </View>
        <Text
          style={{
            color: isActive ? colors.text : colors.placeholderText,
            ...(style as object),
          }}
          className="ml-4 tracking-wide text-base font-uber-move-medium"
        >
          {prompt}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SearchBarButton;
