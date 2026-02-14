import React from "react";
import { View, Animated, Dimensions, ScrollViewProps } from "react-native";
import { ImageSource } from "expo-image";
import { ThemedTextSecondary } from "@themes/themedComponents";
import ImageActionCard from "./ImageActionCard";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";

interface ImageActionItem {
  label: string;
  image: ImageSource;
  imageBackgroundColor?: string;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
}

interface ImageActionCardListProps extends Partial<ScrollViewProps> {
  title: string;
  actions: ImageActionItem[];
}

const CARD_WIDTH = 140;
const CARD_MARGIN = 12;
const HORIZONTAL_PADDING = 20;

const ImageActionCardList: React.FC<ImageActionCardListProps> = ({
  title,
  actions,
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;

  const totalContentWidth =
    actions.length * CARD_WIDTH +
    (actions.length - 1) * CARD_MARGIN +
    HORIZONTAL_PADDING * 2;

  const isScrollable = totalContentWidth > screenWidth;

  const trackWidth = 42;
  const thumbWidth = 26;
  const maxTranslate = trackWidth - thumbWidth;

  const translateX = scrollX.interpolate({
    inputRange: [0, Math.max(totalContentWidth - screenWidth, 1)],
    outputRange: [0, maxTranslate],
    extrapolate: "clamp",
  });

  return (
    <View>
      <View className="flex-row justify-between px-5 items-end">
        <ThemedTextSecondary className="text-sm font-uber-move-medium uppercase tracking-wider">
          {title}
        </ThemedTextSecondary>
        {isScrollable && (
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
        )}
      </View>

      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: HORIZONTAL_PADDING }}
        className="mt-4"
        scrollEnabled={isScrollable}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <View className="flex-row items-start">
          {actions.map((item, index) => (
            <ImageActionCard
              key={index}
              label={item.label}
              image={item.image}
              imageBackgroundColor={item.imageBackgroundColor}
              onPress={item.onPress || (() => {})}
              backgroundColor={item.backgroundColor}
              textColor={item.textColor}
            />
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default ImageActionCardList;
