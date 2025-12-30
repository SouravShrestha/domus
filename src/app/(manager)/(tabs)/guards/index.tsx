import React, { useState, useRef } from "react";
import { View, Text, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import {
  AnimatedTabBar,
  Tab,
  VisitorsTab,
  ResidentsTab,
  SecurityGuardsTab,
} from "@components/manager/people";
import { KeyHomeIcon, PrivacyIcon, VisitorsIcon } from "@/components/icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const tabs: Tab[] = [
  { key: "visitors", title: "Visitors", icon: VisitorsIcon },
  { key: "residents", title: "Residents", icon: KeyHomeIcon },
  { key: "guards", title: "Guards", icon: PrivacyIcon },
];

const ManagerPeopleScreen: React.FC = () => {
  const { themedColors } = useTheme();
  const [activeTab, setActiveTab] = useState("visitors");
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);

  const handleTabChange = (tabKey: string) => {
    const tabIndex = tabs.findIndex((tab) => tab.key === tabKey);
    setActiveTab(tabKey);
    flatListRef.current?.scrollToIndex({ index: tabIndex, animated: true });
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (tabs[index]) {
      setActiveTab(tabs[index].key);
    }
  };

  const renderTabContent = ({ item }: { item: Tab }) => {
    return (
      <View style={{ width: SCREEN_WIDTH }}>
        {item.key === "visitors" && <VisitorsTab />}
        {item.key === "residents" && <ResidentsTab />}
        {item.key === "guards" && <SecurityGuardsTab />}
      </View>
    );
  };

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="my-4">
          <AnimatedTabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </View>

        <Animated.FlatList
          ref={flatListRef}
          data={tabs}
          keyExtractor={(item) => item.key}
          renderItem={renderTabContent}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          bounces={false}
        />
      </SafeAreaView>
    </ThemedView>
  );
};

export default ManagerPeopleScreen;

