import React from "react";
import { View, Animated, ScrollViewProps, Dimensions } from "react-native";
import { ThemedTextSecondary } from "@themes/themedComponents";
import ResidenceCard from "./ResidenceCard";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import { ResidenceFloor, ResidenceFloorResponse } from "@/types/api/response/residence";

interface AnimatedVerticalResidenceListProps extends Partial<ScrollViewProps> {
  residences: ResidenceFloorResponse;
  selectedResidence: ResidenceFloor | null;
  onSelectResidence: (residence: ResidenceFloor) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

const AnimatedVerticalResidenceList: React.FC<
  AnimatedVerticalResidenceListProps
> = ({
  residences,
  selectedResidence,
  onSelectResidence,
  emptyMessage = "No residences matching the filters.",
  isLoading = false,
  ...scrollViewProps
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;

  const itemWidth = screenWidth / 2.8;
  const trackWidth = 42;
  const thumbWidth = 26;
  const maxTranslate = trackWidth - thumbWidth;

  const totalContentWidth = itemWidth * residences.length;
  const maxScrollDistance = Math.max(totalContentWidth - screenWidth, 1);

  const translateX = React.useMemo(() => {
    return scrollX.interpolate({
      inputRange: [0, maxScrollDistance],
      outputRange: [0, maxTranslate],
      extrapolate: "clamp",
    });
  }, [scrollX, maxScrollDistance, maxTranslate]);

  const scrollHandler = React.useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <View>
      {(residences.length > 0 && totalContentWidth > screenWidth) ? (
        <View className="flex-row justify-end px-5">
          <View
            className="mb-1 h-1 w-[48px] rounded-full overflow-hidden"
            style={{ backgroundColor: colors.scrollBackground }}
          >
            <Animated.View
              style={{
                height: "100%",
                width: thumbWidth,
                backgroundColor: colors.accent,
                opacity: 0.8,
                borderRadius: 999,
                transform: [{ translateX }],
              }}
            />
          </View>
        </View>
      ) : <View className="h-1 w-[48px] mb-1 " />}
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        className="mt-6"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        {...scrollViewProps}
      >
        <View className="flex-row items-start" style={{ gap: 12 }}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <View key={`placeholder-${index}`} style={{ width: itemWidth }}>
                <View
                  className="px-4 py-3 rounded-lg border animate-pulse"
                  style={{
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                >
                  <View className="flex-row items-start justify-start">
                    <View className="flex-1">
                      <View
                        className="h-6 rounded mb-3"
                        style={{
                          backgroundColor: colors.border,
                          width: "100%",
                        }}
                      />
                      <View className="flex items-start" style={{ gap: 4 }}>
                        <View
                          className="h-4 rounded"
                          style={{
                            backgroundColor: colors.border,
                            width: "60%",
                          }}
                        />
                        <View
                          className="h-4 rounded"
                          style={{
                            backgroundColor: colors.border,
                            width: "50%",
                          }}
                        />
                        <View
                          className="h-4 rounded"
                          style={{
                            backgroundColor: colors.border,
                            width: "50%",
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : residences.length > 0 ? (
            residences.map((residence) => (
              <View key={residence.id} style={{ width: itemWidth }}>
                <ResidenceCard
                  residence={residence}
                  isSelected={selectedResidence?.id === residence.id}
                  onPress={() => onSelectResidence(residence)}
                />
              </View>
            ))
          ) : (
            <View
              className="items-center justify-center py-12"
              style={{ width: screenWidth - 32 }}
            >
              <ThemedTextSecondary className="text-base font-lato-regular tracking-wide text-center">
                {emptyMessage}
              </ThemedTextSecondary>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default AnimatedVerticalResidenceList;
