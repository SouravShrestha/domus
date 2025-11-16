import React from "react";
import { ViewStyle, StyleProp } from "react-native";
import { ThemedView } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";

interface DividerProps {
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ style, className }) => {
  const { themedColors } = useTheme();
  const backgroundColor = themedColors.cardBackground || "#fff";

  return (
    <ThemedView
      style={[{ height: 8, marginHorizontal: -20, backgroundColor, width: "200%" }, style]}
      className={className}
    />
  );
};

export default Divider;
