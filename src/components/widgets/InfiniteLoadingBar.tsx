import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";

const InfiniteLoadingBar: React.FC = () => {
  const translateX = useRef(new Animated.Value(-100)).current;
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 300,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -100,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [translateX]);

  return (
    <View className="h-0.5 overflow-hidden relative rounded-sm mt-1" style={{ backgroundColor: colors.border }}>
      <Animated.View
        className="absolute h-full w-2/5"
        style={{ transform: [{ translateX }], backgroundColor: colors.accent}}
      />
    </View>
  );
};

export default InfiniteLoadingBar;
