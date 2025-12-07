import React from "react";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";

const GuardVisitorsScreen: React.FC = () => {
  const { themedColors } = useTheme();

  // Placeholder data - will be replaced with real data
  const activeVisitors: Array<{
    id: string;
    name: string;
    residence: string;
    entryTime: string;
  }> = [];

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <ThemedText className="text-lg font-uber-move-medium mb-2">
        No Active Visitors
      </ThemedText>
      <Text
        className="text-sm font-lato-regular text-center"
        style={{ color: themedColors.secondaryText }}
      >
        Visitors currently inside the society will appear here
      </Text>
    </View>
  );

  const renderVisitorItem = ({
    item,
  }: {
    item: { id: string; name: string; residence: string; entryTime: string };
  }) => (
    <View
      className="mx-4 mb-3 p-4 rounded-xl"
      style={{ backgroundColor: themedColors.card }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <ThemedText className="text-base font-uber-move-medium">
            {item.name}
          </ThemedText>
          <Text
            className="text-sm font-lato-regular mt-1"
            style={{ color: themedColors.secondaryText }}
          >
            Visiting: {item.residence}
          </Text>
        </View>
        <Text
          className="text-xs font-lato-regular"
          style={{ color: themedColors.secondaryText }}
        >
          {item.entryTime}
        </Text>
      </View>
    </View>
  );

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <View className="px-4 py-3">
          <ThemedText className="text-2xl font-uber-move-medium">
            Active Visitors
          </ThemedText>
          <Text
            className="text-sm font-lato-regular mt-1"
            style={{ color: themedColors.secondaryText }}
          >
            {activeVisitors.length} visitors currently inside
          </Text>
        </View>

        <FlatList
          data={activeVisitors}
          keyExtractor={(item) => item.id}
          renderItem={renderVisitorItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </SafeAreaView>
    </ThemedView>
  );
};

export default GuardVisitorsScreen;

