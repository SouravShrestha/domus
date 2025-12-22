import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { Portal } from "@gorhom/portal";
import { ThemedView, ThemedText } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import { useAuth } from "@contexts/authContext";
import {
  getDashboardStats,
  getAttentionItems,
} from "@api/services/managerDashboard.service";
import { notificationService } from "@/api/services/notification.service";
import { getUserDisplayName } from "@/utils/textHelpers";
import {
  DashboardStats,
  AttentionItem,
} from "@interfaces/managerDashboard.interface";

import {
  BellIcon,
  TotalResidencesIcon,
  VisitorsIcon,
  ExclamationIcon,
  BookingsIcon,
  ArrowIcon,
  CheckCircleIcon,
} from "@/components/icons";
import { ProfileIcon } from "@components/widgets/ProfileIcon";
import SocietySwitcher, {
  SocietySwitcherSheet,
  SocietySwitcherSheetRef,
} from "@components/widgets/SocietySwitcher";
import basicColors from "@/themes/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import AppFooter from "@/components/widgets/AppFooter";

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  onPress?: () => void;
}> = ({ label, value, icon, color, onPress }) => {
  const { themedColors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.8 : 1}
      className="flex-1 p-4 rounded-lg"
      style={{ backgroundColor: themedColors.cardBackground }}
    >
      <View
        className="w-8 h-8 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: color + "30" }}
      >
        {icon}
      </View>
      <ThemedText className="text-xl font-uber-move-medium tracking-wide">
        {value}
      </ThemedText>
      <ThemedText className="text-base font-uber-move-medium mt-1">
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

const AttentionCard: React.FC<{
  item: AttentionItem;
  onPress: () => void;
}> = ({ item, onPress }) => {
  const { themedColors } = useTheme();

  const getTypeIcon = () => {
    switch (item.type) {
      case "pending_approval":
        return (
          <View
            className="w-12 h-12 rounded-sm items-center justify-center"
            style={{ backgroundColor: basicColors.navyBlue + "20" }}
          >
            <TotalResidencesIcon
              width={18}
              height={18}
              color={basicColors.navyBlue}
            />
          </View>
        );
      case "open_complaint":
        return (
          <View
            className="w-12 h-12 rounded-sm items-center justify-center"
            style={{ backgroundColor: basicColors.orange + "20" }}
          >
            <ExclamationIcon
              width={18}
              height={18}
              color={basicColors.orange}
            />
          </View>
        );
      default:
        return (
          <View
            className="w-12 h-12 rounded-sm items-center justify-center"
            style={{ backgroundColor: themedColors.accent + "20" }}
          >
            <BellIcon width={18} height={18} color={themedColors.accent} />
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center mb-7"
    >
      {getTypeIcon()}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-start">
          <ThemedText
            className="text-base font-uber-move-medium flex-1"
            numberOfLines={1}
          >
            {item.title}
          </ThemedText>
          <View style={{ transform: [{ rotate: "180deg" }] }}>
            <ArrowIcon
              width={18}
              height={18}
              stroke={themedColors.secondaryText}
            />
          </View>
        </View>
        <Text
          className="text-sm font-lato-regular mt-1"
          style={{ color: themedColors.secondaryText }}
          numberOfLines={1}
        >
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const EmptyAttentionState: React.FC = () => {
  const { themedColors } = useTheme();

  return (
    <View className="items-center py-8">
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: basicColors.brightGreen + "20" }}
      >
        <CheckCircleIcon
          width={24}
          height={24}
          color={basicColors.brightGreen}
        />
      </View>
      <ThemedText className="text-base font-uber-move-medium">
        You are all caught up
      </ThemedText>
      <Text
        className="text-sm font-lato-regular mt-1"
        style={{ color: themedColors.secondaryText }}
      >
        No pending items require your attention
      </Text>
    </View>
  );
};

const ManagerDashboard: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const { profile } = useAuth();
  const societySwitcherSheetRef = useRef<SocietySwitcherSheetRef>(null);
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState<DashboardStats>({
    totalResidents: 0,
    activeVisitors: 0,
    openComplaints: 0,
    currentBookings: 0,
  });
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAttentionExpanded, setIsAttentionExpanded] = useState(false);
  const expandAnimation = useRef(new Animated.Value(0)).current;

  const toggleExpand = useCallback(() => {
    const toValue = isAttentionExpanded ? 0 : 1;
    Animated.timing(expandAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsAttentionExpanded(!isAttentionExpanded);
  }, [isAttentionExpanded, expandAnimation]);

  const societyId = currentResidence?.society_id;

  const fetchData = useCallback(
    async (showRefresh = false) => {
      if (!societyId) return;

      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const [statsData, attentionData, unread] = await Promise.all([
          getDashboardStats(societyId),
          getAttentionItems(societyId),
          notificationService.getUnreadCount(),
        ]);

        setStats(statsData);
        setAttentionItems(attentionData);
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [societyId]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleOpenSocietySwitcher = () => {
    societySwitcherSheetRef.current?.open();
  };

  const handleNotifications = () => {
    router.push("/(manager)/screens/notifications");
  };

  const handleProfile = () => {
    router.push("/(manager)/screens/profile/profileScreen");
  };

  const handleStatPress = (type: string) => {
    switch (type) {
      case "residents":
        router.push("/(manager)/(tabs)/residents");
        break;
      case "visitors":
        break;
      case "complaints":
        break;
      case "bookings":
        break;
    }
  };

  const handleAttentionItemPress = (item: AttentionItem) => {
    switch (item.type) {
      case "pending_approval":
        break;
      case "open_complaint":
        break;
    }
  };

  if (isLoading) {
    return (
      <ThemedView className="flex-1">
        <LoadingOverlay currentTheme={currentTheme} />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <ScrollView
        className="flex-1"
        style={{ marginTop: insets.top }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={themedColors.accent}
          />
        }
      >
        <View className="px-6 py-3 flex-row items-center justify-between">
          <SocietySwitcher onPress={handleOpenSocietySwitcher} />
          <View className="flex-row items-center" style={{ gap: 24 }}>
            <TouchableOpacity onPress={handleNotifications} hitSlop={10}>
              <BellIcon
                width={20}
                height={20}
                color={themedColors.text}
                notificationCount={unreadCount}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleProfile} hitSlop={10}>
              <ProfileIcon
                username={getUserDisplayName(profile)}
                avatarUrl={profile?.photo_url}
                size={32}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View className="px-5 mt-8">
          <View className="flex-row mb-5" style={{ gap: 16 }}>
            <StatCard
              label="total residents"
              value={stats.totalResidents}
              icon={
                <TotalResidencesIcon
                  width={16}
                  height={16}
                  color={basicColors.blue}
                />
              }
              color={basicColors.blue}
              onPress={() => handleStatPress("residents")}
            />
            <StatCard
              label="active visitors"
              value={stats.activeVisitors}
              icon={
                <VisitorsIcon
                  width={16}
                  height={16}
                  color={basicColors.brightGreen}
                />
              }
              color={basicColors.brightGreen}
              onPress={() => handleStatPress("visitors")}
            />
          </View>
          <View className="flex-row" style={{ gap: 16 }}>
            <StatCard
              label="open complaints"
              value={stats.openComplaints}
              icon={
                <ExclamationIcon
                  width={16}
                  height={16}
                  color={basicColors.red}
                />
              }
              color={basicColors.red}
              onPress={() => handleStatPress("complaints")}
            />
            <StatCard
              label="current bookings"
              value={stats.currentBookings}
              icon={
                <BookingsIcon
                  width={16}
                  height={16}
                  color={basicColors.orange}
                />
              }
              color={basicColors.orange}
              onPress={() => handleStatPress("bookings")}
            />
          </View>
        </View>

        <View className="mt-12 px-6">
          <View className="mb-4">
            <ThemedText className="text-xl font-uber-move-medium tracking-wide">
              Need your attention
            </ThemedText>
            <Text
              className="text-sm font-lato-regular mt-1"
              style={{ color: themedColors.secondaryText }}
            >
              {attentionItems.length > 0
                ? "Here are what you need to quickly act on"
                : "Nothing pending at the moment"}
            </Text>
          </View>

          <View className="mt-4">
            {attentionItems.length > 0 ? (
              <>
                {attentionItems.slice(0, 2).map((item) => (
                  <View key={item.id}>
                    <AttentionCard
                      item={item}
                      onPress={() => handleAttentionItemPress(item)}
                    />
                  </View>
                ))}
                {attentionItems.length > 2 && isAttentionExpanded && (
                  <Animated.View
                    style={{
                      opacity: expandAnimation,
                    }}
                  >
                    {attentionItems.slice(2).map((item) => (
                      <Animated.View
                        key={item.id}
                        style={{
                          opacity: expandAnimation,
                          transform: [
                            {
                              translateY: expandAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-10, 0],
                              }),
                            },
                          ],
                        }}
                      >
                        <AttentionCard
                          item={item}
                          onPress={() => handleAttentionItemPress(item)}
                        />
                      </Animated.View>
                    ))}
                  </Animated.View>
                )}
                {attentionItems.length > 2 && (
                  <TouchableOpacity
                    onPress={toggleExpand}
                    className="flex-row items-center justify-center mt-1 mb-4"
                    activeOpacity={0.7}
                  >
                    <Text
                      className="text-sm font-uber-move-medium mr-2 border-b"
                      style={{
                        color: themedColors.text,
                        borderColor: themedColors.text,
                      }}
                    >
                      {isAttentionExpanded ? "Show less" : "Show more"}
                    </Text>
                    <Animated.View
                      style={{
                        transform: [
                          {
                            rotate: expandAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["-90deg", "90deg"],
                            }),
                          },
                        ],
                      }}
                    >
                      <ArrowIcon
                        width={18}
                        height={18}
                        stroke={themedColors.text}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <EmptyAttentionState />
            )}
          </View>
        </View>

        {/* Footer */}
        <View className="mt-12 mb-12 px-5 items-start">
          <AppFooter />
        </View>
      </ScrollView>
      <Portal name="global">
        <SocietySwitcherSheet ref={societySwitcherSheetRef} />
      </Portal>
    </ThemedView>
  );
};

export default ManagerDashboard;
