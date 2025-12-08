import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import PlusIcon from "@components/icons/PlusIcon";
import { getGuardsBySocietyId } from "@/api/services/guard.service";
import type { SocietyGuardWithDetails } from "@/api/interfaces/guard.interface";
import { showErrorToast } from "@/utils/toast";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import basicColors from "@/themes/colors";

const ManagerGuardsScreen: React.FC = () => {
  const { themedColors } = useTheme();
  const { currentResidence } = useResidence();

  const [guards, setGuards] = useState<SocietyGuardWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchGuards = async (showRefreshIndicator = false) => {
    if (!currentResidence?.society_id) {
      setIsLoading(false);
      return;
    }

    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const { data, error } = await getGuardsBySocietyId(
        currentResidence.society_id
      );

      if (error) {
        showErrorToast("Failed to load guards");
        return;
      }

      setGuards(data || []);
    } catch (error) {
      showErrorToast("Failed to load guards");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGuards();
    }, [currentResidence?.society_id])
  );

  const handleRefresh = () => {
    fetchGuards(true);
  };

  const handleAddGuard = () => {
    router.push("/(manager)/screens/add-guard");
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

  const renderGuardItem = ({ item }: { item: SocietyGuardWithDetails }) => (
    <View
      className="mx-4 mb-3 p-4 rounded-xl"
      style={{ backgroundColor: themedColors.cardBackground }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <ThemedText className="text-base font-uber-move-medium">
            {item.user.name}
          </ThemedText>
          <Text
            className="text-sm font-lato-regular mt-1"
            style={{ color: themedColors.secondaryText }}
          >
            {formatPhoneForDisplay(item.user.phone)}
          </Text>
        </View>
        <View
          className="px-2 py-1 rounded"
          style={{
            backgroundColor:
              item.status === "active"
                ? themedColors.success + "20"
                : basicColors.gold + "20",
          }}
        >
          <Text
            className="text-xs font-uber-move-medium capitalize"
            style={{
              color:
                item.status === "active"
                  ? themedColors.success
                  : basicColors.gold,
            }}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView className="flex-1">
        <ThemedStatusBar />
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={themedColors.accent} />
        </SafeAreaView>
      </ThemedView>
    );
  }

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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={themedColors.accent}
            />
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
};

export default ManagerGuardsScreen;

