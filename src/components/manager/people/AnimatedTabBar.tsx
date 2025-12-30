import React, { useRef, useEffect } from "react";
import { View, TouchableOpacity, Animated, LayoutChangeEvent } from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";

export interface Tab {
  key: string;
  title: string;
  count?: number;
  icon?: React.FC<{ width?: number; height?: number; color?: string }>;
}

interface AnimatedTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
}

const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  const { themedColors } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const tabWidths = useRef<number[]>([]);
  const tabPositions = useRef<number[]>([]);
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  const activeIndex = tabs.findIndex((tab) => tab.key === activeTab);

  useEffect(() => {
    if (tabPositions.current.length > 0 && tabWidths.current.length > 0) {
      const position = tabPositions.current[activeIndex] || 0;
      const width = tabWidths.current[activeIndex] || 0;

      Animated.parallel([
        Animated.spring(translateX, {
          toValue: position,
          useNativeDriver: false,
          tension: 300,
          friction: 30,
        }),
        Animated.spring(indicatorWidth, {
          toValue: width,
          useNativeDriver: false,
          tension: 300,
          friction: 30,
        }),
      ]).start();
    }
  }, [activeIndex, translateX, indicatorWidth]);

  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    tabPositions.current[index] = x;
    tabWidths.current[index] = width;

    if (index === activeIndex) {
      translateX.setValue(x);
      indicatorWidth.setValue(width);
    }
  };

  return (
    <View className="border-b" style={{ borderColor: themedColors.lightBorder }}>
      <View className="flex-row relative">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.key}
              onLayout={(e) => handleTabLayout(index, e)}
              onPress={() => onTabChange(tab.key)}
              className="flex-1 pb-3 px-3 items-center justify-center flex-row gap-x-2"
              activeOpacity={0.7}
            >
              {IconComponent && (
                <IconComponent
                  width={12}
                  height={12}
                  color={
                    isActive ? themedColors.accent : themedColors.secondaryText
                  }
                />
              )}
              <ThemedText
                className="text-base font-uber-move-medium"
                style={{
                  color: isActive
                    ? themedColors.accent
                    : themedColors.secondaryText,
                }}
              >
                {tab.title}
                {tab.count !== undefined && tab.count > 0
                  ? ` (${tab.count})`
                  : ""}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
        <Animated.View
          className="absolute bottom-0 h-[2px]"
          style={{
            backgroundColor: themedColors.accent,
            transform: [{ translateX }],
            width: indicatorWidth,
          }}
        />
      </View>
    </View>
  );
};

export default AnimatedTabBar;
