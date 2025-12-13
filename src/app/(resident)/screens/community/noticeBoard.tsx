import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  StatusBar,
  View,
  FlatList,
  RefreshControl,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedHR,
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
} from "@themes/themedComponents";
import { router } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { useResidence } from "@/contexts/residenceContext";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { getSocietyNotices } from "@/api/services/notice.service";
import { showErrorToast } from "@/utils/toast";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import EmptyStateView from "@/components/widgets/EmptyStateView";
import emptyViewImage from "@assets/images/girl-empty-box.png";
import { NoticeBoardIcon, ArrowIcon } from "@/components/icons";
import { Notice } from "@/api/interfaces/notice.interface";
import basicColors from "@themes/colors";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";

type TimeFilter = "all" | "today" | "week" | "month";

const NoticeBoardScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const filteredNotices = useMemo(() => {
    const now = new Date();

    return notices.filter((notice) => {
      const createdAt = new Date(notice.created_at);

      if (timeFilter === "today") {
        return isWithinInterval(createdAt, {
          start: startOfDay(now),
          end: endOfDay(now),
        });
      } else if (timeFilter === "week") {
        return isWithinInterval(createdAt, {
          start: startOfDay(subDays(now, 7)),
          end: endOfDay(now),
        });
      } else if (timeFilter === "month") {
        return isWithinInterval(createdAt, {
          start: startOfDay(subDays(now, 30)),
          end: endOfDay(now),
        });
      }

      return true;
    }).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [notices, timeFilter]);

  const fetchNotices = useCallback(async () => {
    if (!currentResidence?.society?.id) return;

    try {
      const { data, error } = await getSocietyNotices(
        currentResidence.society.id
      );
      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch notices";
      showErrorToast(message);
    }
  }, [currentResidence]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchNotices();
      setIsLoading(false);
    };
    loadData();
  }, [fetchNotices]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotices();
    setIsRefreshing(false);
  };

  const handleNoticePress = (notice: Notice) => {
    setSelectedNotice(notice);
    bottomSheetRef.current?.expand();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    []
  );

  const renderFilterChip = (
    label: string,
    value: TimeFilter,
    icon?: React.ReactNode
  ) => {
    const isActive = value === timeFilter;
    return (
      <TouchableOpacity
        onPress={() => setTimeFilter(value)}
        className="px-4 py-[5px] rounded-full flex-row items-center"
        style={{
          backgroundColor: isActive
            ? themedColors.accent
            : themedColors.cardBackground,
          borderWidth: 1,
          borderColor: isActive
            ? themedColors.accent
            : themedColors.lightBorder,
          gap: 6,
        }}
      >
        {icon}
        <ThemedTextSecondary
          className="text-sm font-uber-move-medium"
          style={{
            color: isActive
              ? themedColors.textOnAccent
              : themedColors.text,
          }}
        >
          {label}
        </ThemedTextSecondary>
      </TouchableOpacity>
    );
  };

  const renderNoticeCard = ({ item }: { item: Notice }) => {
    return (
      <TouchableOpacity
        onPress={() => handleNoticePress(item)}
        className="rounded-md mb-3 p-4"
        style={{
          backgroundColor: themedColors.cardBackground,
          borderColor: themedColors.lightBorder,
          borderWidth: 0.5,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-start flex-1 mr-3">
            <View
              className="mr-3 p-2.5 rounded-lg"
              style={{ backgroundColor: basicColors.purple + "20" }}
            >
              <NoticeBoardIcon
                width={18}
                height={18}
                color={basicColors.purple}
              />
            </View>
            <View className="flex-1">
              <ThemedText
                className="text-base font-uber-move-medium tracking-wide"
                numberOfLines={2}
              >
                {item.title}
              </ThemedText>
              <ThemedTextSecondary className="text-sm font-lato-regular mt-1">
                {format(new Date(item.created_at), "dd MMM yyyy")}
              </ThemedTextSecondary>
            </View>
          </View>
          <View style={{ transform: [{ rotate: "-90deg" }] }}>
            <ArrowIcon
              width={16}
              height={16}
              stroke={themedColors.secondaryText}
            />
          </View>
        </View>

        <ThemedTextSecondary className="text-sm mt-3 leading-5" numberOfLines={2}>
          {item.content}
        </ThemedTextSecondary>
      </TouchableOpacity>
    );
  };

  const ListHeaderComponent = () => (
    <View className="pb-2 mb-3 -mx-4">
      <ThemedHeaderWithBack
        onBackPress={() => router.back()}
        title="notice board"
      />

      <View className="mt-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 24 }}
        >
          {renderFilterChip("All Time", "all")}
          {renderFilterChip("Today", "today")}
          {renderFilterChip("This Week", "week")}
          <View className="mr-6">
            {renderFilterChip("This Month", "month")}
          </View>
        </ScrollView>
      </View>

      {filteredNotices.length > 0 && (
        <View className="mt-6 mx-6">
          <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider">
            {filteredNotices.length}{" "}
            {filteredNotices.length === 1 ? "Notice" : "Notices"} Found
          </ThemedTextSecondary>
        </View>
      )}
    </View>
  );

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      {isLoading && !isRefreshing && (
        <LoadingOverlay currentTheme={currentTheme} />
      )}

      <View
        className="flex-1"
        style={{
          marginTop: insets.top,
        }}
      >
        <FlatList
          data={filteredNotices}
          renderItem={renderNoticeCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: insets.bottom + 20,
            flexGrow: 1,
          }}
          ListHeaderComponent={ListHeaderComponent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={themedColors.accent}
            />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View className="flex-1 justify-center items-center">
                <EmptyStateView
                  title="No notices"
                  subtitle1="Check back later for community updates."
                  icon={
                    <Image
                      source={emptyViewImage}
                      className="w-56 h-56 -mt-3"
                      resizeMode="contain"
                    />
                  }
                  backgroundColor={basicColors.gray + "50"}
                  imageOverflow={true}
                />
              </View>
            ) : null
          }
        />
      </View>

      <Portal hostName="global">
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          enablePanDownToClose
          enableDynamicSizing
          maxDynamicContentSize={600}
          backgroundStyle={{
            backgroundColor: themedColors.modal,
          }}
          handleIndicatorStyle={{
            backgroundColor: themedColors.accent,
          }}
          containerStyle={{
            zIndex: 9999,
            elevation: 9999,
          }}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetScrollView
            style={{
              backgroundColor: themedColors.modal,
            }}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 32,
            }}
          >
            {selectedNotice && (
              <View className="px-8 pt-6">
                <View className="flex-row items-start mb-4">
                  <View
                    className="mr-3 p-3 rounded-lg"
                    style={{ backgroundColor: basicColors.purple + "20" }}
                  >
                    <NoticeBoardIcon
                      width={24}
                      height={24}
                      color={basicColors.purple}
                    />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-lg font-uber-move-medium tracking-wide">
                      {selectedNotice.title}
                    </ThemedText>
                    <ThemedTextSecondary className="text-sm font-lato-regular mt-1">
                      {format(new Date(selectedNotice.created_at), "EEEE, dd MMM yyyy")}
                    </ThemedTextSecondary>
                  </View>
                </View>

                <ThemedHR className="mb-4" />

                <View className="p-4">
                  <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider mb-2">
                    Notice Content
                  </ThemedTextSecondary>
                  <ThemedText className="text-base font-lato-regular leading-6">
                    {selectedNotice.content}
                  </ThemedText>
                </View>

                <ThemedHR className="mb-2" />
                <View className="p-4">
                  <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider mb-1">
                    Posted On
                  </ThemedTextSecondary>
                  <ThemedText className="text-sm font-uber-move-medium">
                    {format(new Date(selectedNotice.created_at), "dd MMM yyyy, hh:mm a")}
                  </ThemedText>
                </View>
              </View>
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </Portal>
    </ThemedView>
  );
};

export default NoticeBoardScreen;
