import React from "react";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";

const ManagerResidentsScreen: React.FC = () => {
  const { themedColors } = useTheme();

  // Placeholder data - will be replaced with real data
  const residents: Array<{
    id: string;
    name: string;
    unit: string;
    role: string;
  }> = [];

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <ThemedText className="text-lg font-uber-move-medium mb-2">
        No Residents Yet
      </ThemedText>
      <Text
        className="text-sm font-lato-regular text-center"
        style={{ color: themedColors.secondaryText }}
      >
        Approved residents will appear here
      </Text>
    </View>
  );

  const renderResidentItem = ({
    item,
  }: {
    item: { id: string; name: string; unit: string; role: string };
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
            {item.unit} • {item.role}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <View className="px-4 py-3">
          <ThemedText className="text-2xl font-uber-move-medium">
            Residents
          </ThemedText>
          <Text
            className="text-sm font-lato-regular mt-1"
            style={{ color: themedColors.secondaryText }}
          >
            {residents.length} total residents
          </Text>
        </View>

        <FlatList
          data={residents}
          keyExtractor={(item) => item.id}
          renderItem={renderResidentItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </SafeAreaView>
    </ThemedView>
  );
};

export default ManagerResidentsScreen;

