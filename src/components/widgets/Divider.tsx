import React from "react";
import { ViewStyle, StyleProp } from "react-native";
import { ThemedView } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";

interface DividerProps {
  style?: StyleProp<ViewStyle>;
  className?: string;
  height?: number;
}

const Divider: React.FC<DividerProps> = ({ style, className, height = 8 }) => {
  const { themedColors } = useTheme();
  const backgroundColor = themedColors.cardBackground || "#fff";

  return (
    <ThemedView
      style={[
        { height, marginHorizontal: -20, backgroundColor, width: "200%" },
        style,
      ]}
      className={className}
    />
  );
};

export default Divider;
