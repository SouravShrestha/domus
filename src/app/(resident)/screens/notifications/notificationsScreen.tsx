import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedHR,
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
} from "@themes/themedComponents";
import {
  Image,
  RefreshControl,
  StatusBar,
  View,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { useTheme } from "@/contexts/themeContext";
import colorMapping from "@themes/colors";
import EmptyStateView from "@/components/widgets/EmptyStateView";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { notificationService } from "@/api/services/notification.service";
import { showErrorToast } from "@/utils/toast";
import { Notification } from "@models/notification";
import emptyViewImage from "@assets/images/girl-empty-box.png";
import {
  groupNotifications,
  getNotificationConfig,
  NotificationFilter,
} from "@/utils/notificationHelpers";
import ApprovalRequestBottomSheet, {
  ApprovalRequestBottomSheetRef,
} from "@/components/widgets/ApprovalRequestBottomSheet";

const NotificationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentTheme, themedColors } = useTheme();
  const approvalSheetRef = useRef<ApprovalRequestBottomSheetRef>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("All");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const TAKE = 20;

  const fetchNotifications = useCallback(
    async (skipOffset = 0, append = false) => {
      try {
        const fetchedNotifications =
          await notificationService.getMyNotifications(skipOffset, TAKE);

        if (append) {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const newNotifications = fetchedNotifications.filter(
              (n) => !existingIds.has(n.id)
            );
            return [...prev, ...newNotifications];
          });
        } else {
          setNotifications(fetchedNotifications);
        }

        const hasMoreData = fetchedNotifications.length === TAKE;
        setHasMore(hasMoreData);
        setSkip(skipOffset + fetchedNotifications.length);
      } catch {
        showErrorToast("Could not fetch notifications. Try again.");
        setHasMore(false);
      }
    },
    [TAKE]
  );

  const loadMoreNotifications = useCallback(async () => {
    if (loadingMore || !hasMore || loading || refreshing) {
      return;
    }

    setLoadingMore(true);
    await fetchNotifications(skip, true);
    setLoadingMore(false);
  }, [loadingMore, hasMore, loading, skip, fetchNotifications, refreshing]);

  const refreshNotifications = useCallback(async () => {
    setRefreshing(true);
    setSkip(0);
    setHasMore(true);
    await fetchNotifications(0, false);
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleNotificationPress = async (
    notification: Notification,
    config: {
      routeData?: { pathname: string; params?: Record<string, string> };
      approvalData?: { logId: string };
    }
  ) => {
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    if (config.approvalData) {
      approvalSheetRef.current?.open(config.approvalData.logId);
    } else if (config.routeData) {
      router.push(config.routeData);
    }
  };

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      await fetchNotifications(0, false);
      setLoading(false);
    };
    loadNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(0, false);
    }, [fetchNotifications])
  );

  const filteredNotifications = React.useMemo(() => {
    if (activeFilter === "All") return notifications;
    if (activeFilter === "Unread") {
      return notifications.filter((n) => !n.is_read);
    }
    return notifications;
  }, [notifications, activeFilter]);

  const groupedNotifications = React.useMemo(() => {
    const grouped = groupNotifications(filteredNotifications);
    return Object.keys(grouped).map((title) => ({
      title,
      data: grouped[title],
    }));
  }, [filteredNotifications]);

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const config = getNotificationConfig(item);

    return (
      <TouchableOpacity
        onPress={() =>
          handleNotificationPress(item, {
            routeData: config.routeData,
            approvalData: config.approvalData,
          })
        }
        className="mx-2 flex flex-row justify-between mb-6"
      >
        <View className="flex flex-row items-start flex-1">
          <View
            className="flex items-center justify-center p-4 rounded-lg mr-3"
            style={{
              backgroundColor: config.color + "20",
            }}
          >
            <config.icon height={22} width={22} color={config.color} />
          </View>
          <View className="flex-1 pr-2">
            <View className="flex-row justify-between items-start">
              <ThemedText className="text-base flex-1 mr-2 font-lato-regular">
                {config.title}
              </ThemedText>
              {!item.is_read && (
                <View
                  className="w-2 h-2 rounded-full mt-2"
                  style={{ backgroundColor: themedColors.accent }}
                />
              )}
            </View>
            <ThemedTextSecondary className="mt-1 text-sm leading-5">
              {config.body}
            </ThemedTextSecondary>
            <ThemedTextSecondary className="mt-2 text-xs">
              {config.time}
            </ThemedTextSecondary>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView className="flex-1">
      <View
        className="flex-1 px-3 pb-0"
        style={{
          marginTop: insets.top,
        }}
      >
        <StatusBar barStyle="default" animated />
        {loading && <LoadingOverlay currentTheme={currentTheme} />}

        <SectionList
          contentContainerStyle={
            notifications.length === 0
              ? { flexGrow: 1 }
              : { flexGrow: 1, paddingBottom: 20 }
          }
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          sections={groupedNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          renderSectionHeader={({ section: { title } }) => (
            <ThemedView className="mb-5 pt-4 mx-2">
              <ThemedText className="font-uber-move-medium mb-2 uppercase">
                {title}
              </ThemedText>
              <ThemedHR />
            </ThemedView>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshNotifications}
              tintColor={themedColors.accent}
            />
          }
          onEndReached={() => {
            if (!loading && !refreshing && !loadingMore && hasMore) {
              loadMoreNotifications();
            }
          }}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            loadingMore ? (
              <ThemedView className="py-4 items-center">
                <ThemedTextSecondary className="text-sm">
                  Loading more..
                </ThemedTextSecondary>
              </ThemedView>
            ) : null
          }
          ListHeaderComponent={
            <View className="mx-2">
              <View className="flex-row justify-between items-center mb-4 mt-4">
                <ThemedHeaderWithBack
                  onBackPress={() => router.back()}
                  title="notifications"
                  className="-mx-2"
                />
              </View>
              <View className="flex-row mb-4 mt-1" style={{ gap: 10 }}>
                {(["All", "Unread"] as NotificationFilter[]).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    className="px-4 py-[5px] rounded-full"
                    style={{
                      backgroundColor:
                        activeFilter === filter
                          ? themedColors.accent
                          : themedColors.cardBackground,
                      borderWidth: 1,
                      borderColor:
                        activeFilter === filter
                          ? themedColors.accent
                          : themedColors.lightBorder,
                    }}
                  >
                    <ThemedText
                      className="text-sm font-uber-move-medium"
                      style={{
                        color:
                          activeFilter === filter
                            ? themedColors.textOnAccent
                            : themedColors.text,
                      }}
                    >
                      {filter}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          ListEmptyComponent={
            !loading ? (
              <View
                className="flex-1 justify-center items-center mx-4"
                style={{ flexGrow: 1 }}
              >
                <EmptyStateView
                  title={"No notifications yet"}
                  subtitle1={
                    "We'll let you know when something important happens."
                  }
                  icon={
                    <Image
                      source={emptyViewImage}
                      className="w-56 h-56 -mt-3"
                      resizeMode="contain"
                    />
                  }
                  backgroundColor={colorMapping.gray + "50"}
                  imageOverflow={true}
                />
              </View>
            ) : null
          }
        />
      </View>
      <ApprovalRequestBottomSheet
        ref={approvalSheetRef}
        onComplete={refreshNotifications}
      />
    </ThemedView>
  );
};

export default NotificationsScreen;
