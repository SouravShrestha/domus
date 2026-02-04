import React, { useEffect, useState, useCallback } from "react";
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
import { useFocusEffect } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { useAuth } from "@/contexts/authContext";
import { useResidence } from "@/contexts/residenceContext";
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
type ActivityFilter = "all" | "me" | "residence";

const ActivitiesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentTheme, themedColors } = useTheme();
  const { profile } = useAuth();
  const { currentResidence } = useResidence();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityConfigs, setActivityConfigs] = useState<
    Map<string, ActivityConfig>
  >(new Map());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [lastFetched, setLastFetched] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>("all");
  const TAKE = 6;

  // Pre-fetch activity configs for all activities
  const fetchActivityConfigs = useCallback(
    async (activitiesToProcess: Activity[]) => {
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
    },
    [profile],
  );

  const fetchActivities = useCallback(
    async (skipOffset = 0, append = false) => {
      const startTime = Date.now();
      try {
        let fetchedActivities: Activity[];

        if (activeFilter === "all" || activeFilter === "me") {
          fetchedActivities = await activityService.getMyActivities(
            skipOffset,
            TAKE,
          );
        }

        if (activeFilter === "all" || activeFilter === "residence") {
          if (!currentResidence?.id) {
            if (activeFilter === "residence") {
              setActivities([]);
              setHasMore(false);
              return;
            }
          } else {
            const residenceActivities =
              await activityService.getResidenceActivities(
                currentResidence.id,
                skipOffset,
                TAKE,
              );
            if (activeFilter === "all") {
              const combined = [...fetchedActivities!, ...residenceActivities];
              const uniqueCombined = combined.filter(
                (activity, index, self) =>
                  index === self.findIndex((a) => a.id === activity.id),
              );
              uniqueCombined.sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              );
              fetchedActivities = uniqueCombined.slice(0, TAKE);
            } else {
              fetchedActivities = residenceActivities;
            }
          }
        }

        if (append) {
          setActivities((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const newActivities = fetchedActivities.filter(
              (a) => !existingIds.has(a.id),
            );
            if (newActivities.length > 0) {
              fetchActivityConfigs(newActivities);
            }
            return [...prev, ...newActivities];
          });
        } else {
          const uniqueActivities = fetchedActivities.filter(
            (activity, index, self) =>
              index === self.findIndex((a) => a.id === activity.id),
          );
          setActivities(uniqueActivities);
          setLastFetched(Date.now());
          fetchActivityConfigs(uniqueActivities);
        }

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
    },
    [TAKE, fetchActivityConfigs, activeFilter, currentResidence?.id],
  );

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

  const handleFilterChange = useCallback(
    (filter: ActivityFilter) => {
      if (filter === activeFilter) return;
      setActiveFilter(filter);
      setActivities([]);
      setActivityConfigs(new Map());
      setSkip(0);
      setHasMore(true);
      setLastFetched(0);
    },
    [activeFilter],
  );

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      await fetchActivities(0, false);
      setLoading(false);
    };
    loadActivities();
  }, [activeFilter, currentResidence?.id]);

  useEffect(() => {
    const unsubscribe = appEventEmitter.on(AppEvents.ACTIVITIES_UPDATED, () => {
      const timeSinceLastFetch = Date.now() - lastFetched;
      if (timeSinceLastFetch > RefreshThresholds.Activity.EVENT) {
        refreshActivitiesSilently();
      }
    });

    return unsubscribe;
  }, [lastFetched, refreshActivitiesSilently]);

  useFocusEffect(
    useCallback(() => {
      const timeSinceLastFetch = Date.now() - lastFetched;
      const shouldRefresh =
        lastFetched > 0 &&
        timeSinceLastFetch > RefreshThresholds.Activity.FOCUS;

      if (shouldRefresh) {
        refreshActivitiesSilently();
      }
    }, [lastFetched, refreshActivitiesSilently]),
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
            activities.length === 0
              ? { flexGrow: 1 }
              : { flexGrow: 1, paddingBottom: 20 }
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
            <View className="mx-2">
              <ThemedText className="text-3xl font-uber-move-medium tracking-wider mt-3 mb-4">
                recent activities
              </ThemedText>
              <View className="flex-row mb-4 mt-1" style={{ gap: 10 }}>
                <TouchableOpacity
                  onPress={() => handleFilterChange("all")}
                  className="px-4 py-[5px] rounded-full"
                  style={{
                    backgroundColor:
                      activeFilter === "all"
                        ? themedColors.accent
                        : themedColors.cardBackground,
                    borderWidth: 1,
                    borderColor:
                      activeFilter === "all"
                        ? themedColors.accent
                        : themedColors.lightBorder,
                  }}
                >
                  <ThemedText
                    className="text-sm font-uber-move-medium"
                    style={{
                      color:
                        activeFilter === "all"
                          ? themedColors.textOnAccent
                          : themedColors.text,
                    }}
                  >
                    All
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleFilterChange("me")}
                  className="px-4 py-[5px] rounded-full"
                  style={{
                    backgroundColor:
                      activeFilter === "me"
                        ? themedColors.accent
                        : themedColors.cardBackground,
                    borderWidth: 1,
                    borderColor:
                      activeFilter === "me"
                        ? themedColors.accent
                        : themedColors.lightBorder,
                  }}
                >
                  <ThemedText
                    className="text-sm font-uber-move-medium"
                    style={{
                      color:
                        activeFilter === "me"
                          ? themedColors.textOnAccent
                          : themedColors.text,
                    }}
                  >
                    Me
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleFilterChange("residence")}
                  className="px-4 py-[5px] rounded-full"
                  style={{
                    backgroundColor:
                      activeFilter === "residence"
                        ? themedColors.accent
                        : themedColors.cardBackground,
                    borderWidth: 1,
                    borderColor:
                      activeFilter === "residence"
                        ? themedColors.accent
                        : themedColors.lightBorder,
                  }}
                >
                  <ThemedText
                    className="text-sm font-uber-move-medium"
                    style={{
                      color:
                        activeFilter === "residence"
                          ? themedColors.textOnAccent
                          : themedColors.text,
                    }}
                  >
                    Residence
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
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
            const { layoutMeasurement, contentOffset, contentSize } =
              nativeEvent;
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
                <ThemedTextSecondary className="text-sm">
                  Loading more..
                </ThemedTextSecondary>
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
