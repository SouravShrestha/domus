import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from "date-fns";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import EmptyStateView from "@/components/widgets/EmptyStateView";
import emptyViewImage from "@assets/images/girl-empty-box.png";
import { NoticeBoardIcon, ArrowIcon } from "@/components/icons";
import { Notice } from "@/api/interfaces/notice.interface";
import basicColors from "@themes/colors";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import Divider from "@/components/widgets/Divider";

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

    return notices
      .filter((notice) => {
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
      })
      .sort(
        (a, b) =>
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
            color: isActive ? themedColors.textOnAccent : themedColors.text,
          }}
        >
          {label}
        </ThemedTextSecondary>
      </TouchableOpacity>
    );
  };

  const renderNoticeCard = ({
    item,
    index,
  }: {
    item: Notice;
    index: number;
  }) => {
    const isLastItem = index === filteredNotices.length - 1;

    return (
      <>
        <TouchableOpacity
          onPress={() => handleNoticePress(item)}
          className="pb-5 pt-2 px-1"
          activeOpacity={0.6}
        >
          {/* Header: Title */}
          <View className="flex-row items-start justify-between mb-3">
            <ThemedText
              className="text-base font-uber-move-medium leading-6 flex-1 mr-4"
              numberOfLines={2}
            >
              {item.title}
            </ThemedText>
          </View>

          {/* Content Preview */}
          {item.content && (
            <ThemedTextSecondary
              className="text-sm font-lato-regular leading-5 mb-4"
              numberOfLines={2}
            >
              {item.content}
            </ThemedTextSecondary>
          )}

          {/* Meta: Icon + Date + Arrow */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <NoticeBoardIcon
                width={14}
                height={14}
                color={themedColors.secondaryText}
              />
              <ThemedTextSecondary className="text-xs font-lato-regular ml-2">
                {format(new Date(item.created_at), "dd MMM, hh:mm a")}
              </ThemedTextSecondary>
            </View>

            <View style={{ transform: [{ rotate: "180deg" }] }}>
              <ArrowIcon
                width={16}
                height={16}
                stroke={themedColors.secondaryText}
              />
            </View>
          </View>
        </TouchableOpacity>
        {!isLastItem && <Divider className="mt-2 mb-4" />}
      </>
    );
  };

  const ListHeaderComponent = () => (
    <View className="pb-2 mb-3 -mx-4">
      <ThemedHeaderWithBack
        onBackPress={() => router.back()}
        title="notice board"
      />

      <View className="mt-6 -mx-1">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
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
        <View className="mt-10 mx-4">
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
              <View className="px-6 pt-2">
                {/* Title */}
                <ThemedText className="text-xl font-uber-move-medium leading-7 mb-6">
                  {selectedNotice.title}
                </ThemedText>

                {/* Meta row: Icon + Date */}
                <View className="flex-row items-center flex-wrap gap-y-3 mb-8">
                  <View className="flex-row items-center">
                    <NoticeBoardIcon
                      width={16}
                      height={16}
                      color={themedColors.secondaryText}
                    />
                    <ThemedTextSecondary className="text-sm font-lato-regular ml-2">
                      {format(
                        new Date(selectedNotice.created_at),
                        "dd MMM yyyy, hh:mm a"
                      )}
                    </ThemedTextSecondary>
                  </View>
                </View>

                {/* Content */}
                {selectedNotice.content && (
                  <View className="mb-4">
                    <ThemedTextSecondary className="text-xs font-uber-move-medium uppercase tracking-wider mb-3">
                      Content
                    </ThemedTextSecondary>
                    <ThemedText className="text-base font-lato-regular leading-6">
                      {selectedNotice.content}
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </Portal>
    </ThemedView>
  );
};

export default NoticeBoardScreen;
