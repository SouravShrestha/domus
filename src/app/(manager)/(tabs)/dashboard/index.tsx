import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import UsersIcon from "@components/icons/UsersIcon";
import ShieldIcon from "@components/icons/ShieldIcon";
import CheckIcon from "@components/icons/CheckIcon";

const ManagerDashboard: React.FC = () => {
  const { themedColors } = useTheme();
  const router = useRouter();

  // Placeholder stats - will be replaced with real data
  const stats = {
    totalResidences: 0,
    occupiedUnits: 0,
    pendingApprovals: 0,
    activeGuards: 0,
  };

  const StatCard = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color?: string;
  }) => (
    <View
      className="flex-1 p-4 rounded-xl mr-3"
      style={{ backgroundColor: themedColors.card }}
    >
      <ThemedText
        className="text-2xl font-uber-move-bold"
        style={color ? { color } : undefined}
      >
        {value}
      </ThemedText>
      <Text
        className="text-xs font-lato-regular mt-1"
        style={{ color: themedColors.secondaryText }}
      >
        {label}
      </Text>
    </View>
  );

  const QuickAction = ({
    icon: Icon,
    label,
    onPress,
  }: {
    icon: React.FC<{ width: number; height: number; color: string }>;
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 p-4 rounded-xl mr-3 items-center"
      style={{ backgroundColor: themedColors.card }}
      activeOpacity={0.7}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: themedColors.accent + "20" }}
      >
        <Icon width={24} height={24} color={themedColors.accent} />
      </View>
      <ThemedText className="text-xs font-uber-move-medium text-center">
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1">
          <View className="px-4 py-3">
            <ThemedText className="text-2xl font-uber-move-medium">
              Society Dashboard
            </ThemedText>
            <Text
              className="text-sm font-lato-regular mt-1"
              style={{ color: themedColors.secondaryText }}
            >
              Manage your society
            </Text>
          </View>

          {/* Stats Grid */}
          <View className="px-4 mb-6">
            <View className="flex-row mb-3">
              <StatCard label="Total Units" value={stats.totalResidences} />
              <StatCard label="Occupied" value={stats.occupiedUnits} />
            </View>
            <View className="flex-row">
              <StatCard
                label="Pending Approvals"
                value={stats.pendingApprovals}
                color={
                  stats.pendingApprovals > 0
                    ? themedColors.warning
                    : themedColors.text
                }
              />
              <StatCard label="Active Guards" value={stats.activeGuards} />
            </View>
          </View>

          {/* Quick Actions */}
          <View className="px-4 mb-6">
            <ThemedText className="text-lg font-uber-move-medium mb-3">
              Quick Actions
            </ThemedText>
            <View className="flex-row">
              <QuickAction
                icon={CheckIcon}
                label="Approve Members"
                onPress={() => {
                  // TODO: Navigate to approvals screen
                }}
              />
              <QuickAction
                icon={ShieldIcon}
                label="Add Guard"
                onPress={() => {
                  // TODO: Navigate to add guard screen
                }}
              />
              <QuickAction
                icon={UsersIcon}
                label="View Residents"
                onPress={() => {
                  router.push("/(manager)/(tabs)/residents");
                }}
              />
            </View>
          </View>

          {/* Recent Activity */}
          <View className="px-4 mb-6">
            <ThemedText className="text-lg font-uber-move-medium mb-3">
              Recent Activity
            </ThemedText>
            <View
              className="p-4 rounded-xl"
              style={{ backgroundColor: themedColors.card }}
            >
              <Text
                className="text-sm font-lato-regular text-center"
                style={{ color: themedColors.secondaryText }}
              >
                No recent activity
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default ManagerDashboard;

