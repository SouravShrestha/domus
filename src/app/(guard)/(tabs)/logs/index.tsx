import React from "react";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";

const GuardLogsScreen: React.FC = () => {
  const { themedColors } = useTheme();

  // Placeholder data - will be replaced with real data
  const logs: Array<{
    id: string;
    visitorName: string;
    residence: string;
    action: "entry" | "exit";
    time: string;
  }> = [];

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <ThemedText className="text-lg font-uber-move-medium mb-2">
        No Logs Yet
      </ThemedText>
      <Text
        className="text-sm font-lato-regular text-center"
        style={{ color: themedColors.secondaryText }}
      >
        Entry and exit logs will appear here
      </Text>
    </View>
  );

  const renderLogItem = ({
    item,
  }: {
    item: {
      id: string;
      visitorName: string;
      residence: string;
      action: "entry" | "exit";
      time: string;
    };
  }) => (
    <View
      className="mx-4 mb-3 p-4 rounded-xl"
      style={{ backgroundColor: themedColors.card }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center">
            <View
              className="w-2 h-2 rounded-full mr-2"
              style={{
                backgroundColor:
                  item.action === "entry"
                    ? themedColors.success
                    : themedColors.warning,
              }}
            />
            <ThemedText className="text-base font-uber-move-medium">
              {item.visitorName}
            </ThemedText>
          </View>
          <Text
            className="text-sm font-lato-regular mt-1"
            style={{ color: themedColors.secondaryText }}
          >
            {item.action === "entry" ? "Entered" : "Exited"} • {item.residence}
          </Text>
        </View>
        <Text
          className="text-xs font-lato-regular"
          style={{ color: themedColors.secondaryText }}
        >
          {item.time}
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
            Entry/Exit Logs
          </ThemedText>
          <Text
            className="text-sm font-lato-regular mt-1"
            style={{ color: themedColors.secondaryText }}
          >
            Today's activity log
          </Text>
        </View>

        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderLogItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </SafeAreaView>
    </ThemedView>
  );
};

export default GuardLogsScreen;

