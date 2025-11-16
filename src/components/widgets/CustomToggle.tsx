import { useTheme } from "@/contexts/themeContext";
import React, { useEffect, useState, useMemo } from "react";
import { Pressable, Animated } from "react-native";

interface Props {
  value: boolean;
  onValueChange: (v: boolean) => void;
}

const CustomToggle: React.FC<Props> = ({ value, onValueChange }) => {
  const [anim] = useState(() => new Animated.Value(value ? 1 : 0));
  const { themedColors } = useTheme();

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const {
    trackBg,
    thumbWidth,
    thumbTranslate,
    ringWidth,
    thumbBg,
  } = useMemo(() => {
    return {
      trackBg: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [themedColors.border, themedColors.accent],
      }),
      thumbWidth: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 8],
      }),
      thumbTranslate: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 28],
      }),
      ringWidth: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [3, 0],
      }),
      thumbBg: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [themedColors.border, themedColors.textOnAccent],
      }),
    };
  }, [anim, themedColors.border, themedColors.accent, themedColors.textOnAccent]);

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View
        style={{
          width: 46,
          height: 24,
          borderRadius: 20,
          backgroundColor: trackBg,
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            height: 16,
            borderRadius: 50,
            marginLeft: 4,
            width: thumbWidth,
            backgroundColor: thumbBg,
            borderWidth: ringWidth,
            borderColor: themedColors.secondaryText,
            transform: [{ translateX: thumbTranslate }],
          }}
        />
      </Animated.View>
    </Pressable>
  );
};

export default CustomToggle;
