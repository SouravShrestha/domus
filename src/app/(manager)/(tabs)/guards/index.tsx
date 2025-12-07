import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import PlusIcon from "@components/icons/PlusIcon";

const ManagerGuardsScreen: React.FC = () => {
  const { themedColors } = useTheme();

  // Placeholder data - will be replaced with real data
  const guards: Array<{
    id: string;
    name: string;
    phone: string;
    status: "active" | "inactive";
  }> = [];

  const handleAddGuard = () => {
    // TODO: Navigate to add guard screen
    console.log("Add guard");
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <ThemedText className="text-lg font-uber-move-medium mb-2">
        No Guards Yet
      </ThemedText>
      <Text
        className="text-sm font-lato-regular text-center"
        style={{ color: themedColors.secondaryText }}
      >
        Add security guards to manage gate access
      </Text>
    </View>
  );

  const renderGuardItem = ({
    item,
  }: {
    item: {
      id: string;
      name: string;
      phone: string;
      status: "active" | "inactive";
    };
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
            {item.phone}
          </Text>
        </View>
        <View
          className="px-2 py-1 rounded"
          style={{
            backgroundColor:
              item.status === "active"
                ? themedColors.success + "20"
                : themedColors.warning + "20",
          }}
        >
          <Text
            className="text-xs font-uber-move-medium capitalize"
            style={{
              color:
                item.status === "active"
                  ? themedColors.success
                  : themedColors.warning,
            }}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <View className="px-4 py-3 flex-row justify-between items-center">
          <View>
            <ThemedText className="text-2xl font-uber-move-medium">
              Security Guards
            </ThemedText>
            <Text
              className="text-sm font-lato-regular mt-1"
              style={{ color: themedColors.secondaryText }}
            >
              {guards.length} guards assigned
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleAddGuard}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: themedColors.accent }}
            activeOpacity={0.8}
          >
            <PlusIcon width={20} height={20} color={themedColors.textOnAccent} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={guards}
          keyExtractor={(item) => item.id}
          renderItem={renderGuardItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </SafeAreaView>
    </ThemedView>
  );
};

export default ManagerGuardsScreen;

