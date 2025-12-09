import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useGuard } from "@contexts/guardContext";
import { getPendingWalkInApprovals } from "@/api/services/walkInVisitor.service";
import { WalkInVisitorLogWithDetails } from "@/types/models/visitor";
import { Ionicons } from "@expo/vector-icons";

const PendingApprovalsScreen: React.FC = () => {
  const { themedColors } = useTheme();
  const { societyId } = useGuard();
  const router = useRouter();

  const [pendingApprovals, setPendingApprovals] = useState<
    WalkInVisitorLogWithDetails[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (societyId) {
      loadPendingApprovals();
    }
  }, [societyId]);

  const loadPendingApprovals = async () => {
    if (!societyId) return;

    try {
      const { data, error } = await getPendingWalkInApprovals(societyId);
      if (data) {
        setPendingApprovals(data);
      } else {
        console.error("Failed to load pending approvals:", error);
      }
    } catch (error) {
      console.error("Error loading pending approvals:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPendingApprovals();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const renderApprovalItem = ({
    item,
  }: {
    item: WalkInVisitorLogWithDetails;
  }) => (
    <View
      className="p-4 mb-3 rounded-xl"
      style={{ backgroundColor: themedColors.card }}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <ThemedText className="text-lg font-uber-move-medium">
            {item.visitor_name}
          </ThemedText>
          {item.visitor_phone && (
            <Text
              className="text-sm font-lato-regular mt-1"
              style={{ color: themedColors.secondaryText }}
            >
              {item.visitor_phone}
            </Text>
          )}
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${themedColors.accent}20` }}
        >
          <Text
            className="text-xs font-uber-move-medium"
            style={{ color: themedColors.accent }}
          >
            Pending
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons
          name="home-outline"
          size={16}
          color={themedColors.secondaryText}
          style={{ marginRight: 6 }}
        />
        <Text
          className="text-sm font-lato-regular"
          style={{ color: themedColors.secondaryText }}
        >
          {item.residence?.short_name} (
          {item.residence?.block ? `${item.residence.block}-` : ""}
          {item.residence?.flat_number})
        </Text>
      </View>

      {item.purpose && (
        <View className="flex-row items-center mb-2">
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={themedColors.secondaryText}
            style={{ marginRight: 6 }}
          />
          <Text
            className="text-sm font-lato-regular"
            style={{ color: themedColors.secondaryText }}
          >
            {item.purpose}
          </Text>
        </View>
      )}

      <View className="flex-row items-center">
        <Ionicons
          name="time-outline"
          size={16}
          color={themedColors.secondaryText}
          style={{ marginRight: 6 }}
        />
        <Text
          className="text-sm font-lato-regular"
          style={{ color: themedColors.secondaryText }}
        >
          Requested {formatTime(item.entry_time)}
        </Text>
      </View>
    </View>
  );

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={themedColors.text} />
          </TouchableOpacity>
          <ThemedText className="text-2xl font-uber-move-medium">
            Pending Approvals
          </ThemedText>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={themedColors.accent} />
          </View>
        ) : pendingApprovals.length > 0 ? (
          <FlatList
            data={pendingApprovals}
            renderItem={renderApprovalItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={themedColors.accent}
              />
            }
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons
              name="checkmark-circle-outline"
              size={64}
              color={themedColors.secondaryText}
            />
            <Text
              className="text-lg font-uber-move-medium mt-4 text-center"
              style={{ color: themedColors.text }}
            >
              No Pending Approvals
            </Text>
            <Text
              className="text-sm font-lato-regular mt-2 text-center"
              style={{ color: themedColors.secondaryText }}
            >
              All walk-in visitor requests have been processed
            </Text>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
};

export default PendingApprovalsScreen;
