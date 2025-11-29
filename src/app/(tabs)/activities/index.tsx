import React, { useEffect, useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedHR, ThemedText, ThemedTextSecondary, ThemedView } from "@themes/themedComponents";
import {
  Image,
  RefreshControl,
  StatusBar,
  View,
  SectionList,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { useAuth } from "@/contexts/authContext";
import colorMapping from "@themes/colors";
import EmptyStateView from "@/components/widgets/EmptyStateView";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { activityService } from "@/api/services/activity.service";
import { showErrorToast } from "@/utils/toast";
import { format, parseISO } from "date-fns";
import { ActivityLogWithActor } from "@models/activity";
import { getActivityConfig, ActivityConfig } from "@/utils/activityHelpers";
import { appEventEmitter, AppEvents } from "@/utils/eventEmitter";
import { RefreshThresholds } from "@/constants/timeouts";
import { ActivityIcon } from "@/components/icons";
import emptyViewImage from "@assets/images/girl-empty-box.png";

type Activity = ActivityLogWithActor;

const ActivitiesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentTheme, themedColors } = useTheme();
  const { profile } = useAuth();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityConfigs, setActivityConfigs] = useState<Map<string, ActivityConfig>>(new Map());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [lastFetched, setLastFetched] = useState<number>(0);
  const TAKE = 6;

  // Pre-fetch activity configs for all activities
  const fetchActivityConfigs = useCallback(async (activitiesToProcess: Activity[]) => {
    const configPromises = activitiesToProcess.map(async (activity) => {
      const config = await getActivityConfig(activity, profile);
      return [activity.id, config] as [string, ActivityConfig];
    });
    
    const configs = await Promise.all(configPromises);
    
    setActivityConfigs((prev) => {
      const updated = new Map(prev);
      configs.forEach(([id, config]) => {
        updated.set(id, config);
      });
      return updated;
    });
  }, [profile]);

  const fetchActivities = useCallback(async (skipOffset = 0, append = false) => {
    const startTime = Date.now();
    try {
      const fetchedActivities = await activityService.getMyActivities(skipOffset, TAKE);

      if (append) {
        setActivities((prev) => {
          // Create a Set to deduplicate by id
          const existingIds = new Set(prev.map(a => a.id));
          const newActivities = fetchedActivities.filter(a => !existingIds.has(a.id));
          // Fetch configs for new activities only (async, don't await)
          if (newActivities.length > 0) {
            fetchActivityConfigs(newActivities);
          }
          return [...prev, ...newActivities];
        });
      } else {
        // Deduplicate fetched activities by id (in case API returns duplicates)
        const uniqueActivities = fetchedActivities.filter((activity, index, self) =>
          index === self.findIndex(a => a.id === activity.id)
        );
        setActivities(uniqueActivities);
        setLastFetched(Date.now());
        // Fetch configs for all activities
        fetchActivityConfigs(uniqueActivities);
      }
      
      // Check if there are more activities to load
      const hasMoreData = fetchedActivities.length === TAKE;
      setHasMore(hasMoreData);
      setSkip(skipOffset + fetchedActivities.length);
    } catch (error) {
      showErrorToast("Could not fetch activities. Try again.");
      console.error("Error fetching activities:", error);
      setHasMore(false);
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 500 - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }
  }, [TAKE, fetchActivityConfigs]);

  const loadMoreActivities = useCallback(async () => {
    if (loadingMore || !hasMore || loading || refreshing) {
      return;
    }
    
    setLoadingMore(true);
    await fetchActivities(skip, true);
    setLoadingMore(false);
  }, [loadingMore, hasMore, loading, skip, fetchActivities, refreshing]);

  // Manual refresh (user pull-to-refresh)
  const refreshActivities = useCallback(async () => {
    setRefreshing(true);
    setSkip(0);
    setHasMore(true);
    await fetchActivities(0, false);
    setRefreshing(false);
  }, [fetchActivities]);

  // Automatic refresh (on focus/events - doesn't show refresh indicator)
  const refreshActivitiesSilently = useCallback(async () => {
    setSkip(0);
    setHasMore(true);
    await fetchActivities(0, false);
  }, [fetchActivities]);

  // Listen to global events for activity updates
  useEffect(() => {
    const unsubscribe = appEventEmitter.on(AppEvents.ACTIVITIES_UPDATED, () => {
      const timeSinceLastFetch = Date.now() - lastFetched;
      if (timeSinceLastFetch > RefreshThresholds.Activity.EVENT) {
        refreshActivitiesSilently();
      }
    });

    return unsubscribe;
  }, [lastFetched, refreshActivitiesSilently]);

  // Initial fetch on mount and refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadActivities = async () => {
        const isInitialLoad = lastFetched === 0;
        const timeSinceLastFetch = Date.now() - lastFetched;
        const shouldRefresh = isInitialLoad || timeSinceLastFetch > RefreshThresholds.Activity.FOCUS;
        
        if (shouldRefresh) {
          if (isInitialLoad) {
            // Initial load - show loading indicator
            setLoading(true);
          }
          await refreshActivitiesSilently();
          if (isInitialLoad) {
            setLoading(false);
          }
        }
      };
      loadActivities();
    }, [lastFetched, refreshActivitiesSilently])
  );

  const groupActivitiesByDate = (activities: Activity[]) => {
    return activities.reduce((groups: Record<string, Activity[]>, activity) => {
      const date = format(parseISO(activity.created_at), "dd MMM yyyy");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    }, {});
  };

  const renderActivityCard = ({ item }: { item: Activity }) => {
    const config = activityConfigs.get(item.id);
    
    // Fallback config if not yet loaded
    if (!config) {
      return (
        <View className="mx-2 flex flex-row justify-between mb-8">
          <View className="flex flex-row items-start">
            <View
              className="flex items-center justify-start p-4 rounded-lg w-1/6"
              style={{
                backgroundColor: colorMapping.blue + "20",
              }}
            >
              <ActivityIcon height={22} width={22} color={colorMapping.blue} />
            </View>
            <View className="pl-3 w-5/6">
              <ThemedText className="text-base">Loading...</ThemedText>
              <ThemedTextSecondary className="mt-2 tracking-wide font-lato-regular text-xs">
                {format(parseISO(item.created_at), "dd MMM yyyy 'at' hh:mm a")}
              </ThemedTextSecondary>
            </View>
          </View>
        </View>
      );
    }

    const { message, Icon, color } = config;
    return (
      <View className="mx-2 flex flex-row justify-between mb-8">
        <View className="flex flex-row items-start">
          <View
            className="flex items-center justify-start p-4 rounded-lg w-1/6"
            style={{
              backgroundColor: color + "20",
            }}
          >
            <Icon height={22} width={22} color={color} />
          </View>
          <View className="pl-3 w-5/6">
            <ThemedText className="text-base">{message}</ThemedText>
            <ThemedTextSecondary className="mt-2 tracking-wide font-lato-regular text-xs">
              {format(parseISO(item.created_at), "dd MMM yyyy 'at' hh:mm a")}
            </ThemedTextSecondary>
          </View>
        </View>
      </View>
    );
  };

  const groupedActivities = React.useMemo(() => {
    const grouped = groupActivitiesByDate(activities);
    return Object.keys(grouped).map((date) => ({
      title: date,
      data: grouped[date],
    }));
  }, [activities]);

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
          className=""
          contentContainerStyle={
            activities.length === 0 ? { flexGrow: 1 } : { flexGrow: 1, paddingBottom: 20 }
          }
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          sections={groupedActivities}
          keyExtractor={(item) => item.id}
          renderItem={renderActivityCard}
          renderSectionHeader={({ section: { title } }) => (
            <ThemedView className="mb-5 pt-4 mx-2">
              <ThemedText className="font-uber-move-medium mb-2 uppercase">
                {title}
              </ThemedText>
              <ThemedHR />
            </ThemedView>
          )}
          ListHeaderComponent={
            <ThemedText className="text-4xl font-uber-move-medium tracking-wide mt-4 mb-6 mx-2">
              recent activities
            </ThemedText>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshActivities}
              tintColor={themedColors.accent}
            />
          }
          onEndReached={() => {
            if (!loading && !refreshing && !loadingMore && hasMore) {
              loadMoreActivities();
            }
          }}
          onEndReachedThreshold={0.2}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 20;
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom;
            
            if (isCloseToBottom && hasMore && !loadingMore && !loading) {
              loadMoreActivities();
            }
          }}
          scrollEventThrottle={400}
          ListFooterComponent={
            loadingMore ? (
              <ThemedView className="py-4 items-center">
                <ThemedTextSecondary className="text-sm">Loading more..</ThemedTextSecondary>
              </ThemedView>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View
                className="flex-1 justify-center items-center mx-4"
                style={{ flexGrow: 1 }}
              >
                <EmptyStateView
                  title={"Anything you do would be \ndisplayed here"}
                  subtitle1={"Time to create some memories!"}
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
    </ThemedView>
  );
};

export default ActivitiesScreen;
