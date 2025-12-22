import React from "react";
import LottieView from "lottie-react-native";
import { StyleProp, ViewStyle } from "react-native";
import { ThemedView } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";

interface LoaderProps {
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function Loader({ style, className }: LoaderProps) {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  return (
    <ThemedView
      className={`flex-1 justify-center items-center ${className ?? ""}`}
      style={{ backgroundColor: colors.background }}
    >
      <LottieView
        source={
          currentTheme === "dark"
            ? require("@assets/animations/load-for-dark.json")
            : require("@assets/animations/load-for-light.json")
        }
        autoPlay
        loop={true}
        speed={1}
        resizeMode="cover"
        style={[{ width: 100, height: 100 }, style]}
      />
    </ThemedView>
  );
}
