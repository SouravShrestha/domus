import React from "react";
import { View, Animated, Dimensions, ScrollViewProps } from "react-native";
import { ThemedTextSecondary } from "@themes/themedComponents";
import ActionButton from "./ActionButton";
import { useTheme } from "@/contexts/themeContext";
import basicColors, { themeColors } from "@themes/colors";

interface ActionItem {
  label: string;
  icon: React.ComponentType<{ width?: number; height?: number; color?: string }>;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  iconBackgroundColor?: string;
}

interface AnimatedVerticalActionListProps extends Partial<ScrollViewProps> {
  title: string;
  actions: ActionItem[];
}

const AnimatedVerticalActionListInProfile: React.FC<AnimatedVerticalActionListProps> = ({
  title,
  actions,
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;

  const itemWidth = screenWidth / 2.8;
  const trackWidth = 42;
  const thumbWidth = 26;
  const maxTranslate = trackWidth - thumbWidth;

  const totalContentWidth = itemWidth * actions.length;

  const translateX = scrollX.interpolate({
    inputRange: [0, Math.max(totalContentWidth - screenWidth, 1)],
    outputRange: [0, maxTranslate],
    extrapolate: "clamp",
  });

  return (
    <View>
      <View className="flex-row justify-between px-0 items-end">
        <ThemedTextSecondary className="text-xs font-uber-move-medium uppercase tracking-wider">
          {title}
        </ThemedTextSecondary>
        <View
          className="mb-1 h-1 w-[42px] rounded-full overflow-hidden"
          style={{ backgroundColor: colors.scrollBackground }}
        >
          <Animated.View
            style={{
              height: "100%",
              width: thumbWidth,
              backgroundColor: colors.scroll,
              opacity: 0.8,
              borderRadius: 999,
              transform: [{ translateX }],
            }}
          />
        </View>
      </View>

      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4 -mx-5"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View className="flex-row items-start pl-4">
          {actions.map((feature, index) => (
            <ActionButton
              key={index}
              label={feature.label}
              icon={feature.icon}
              onPress={feature.onPress || (() => {})}
              backgroundColor={feature.backgroundColor}
              textColor={feature.textColor}
              iconColor={feature.iconColor}
              iconBackgroundColor={feature.iconBackgroundColor}
            />
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default AnimatedVerticalActionListInProfile;
