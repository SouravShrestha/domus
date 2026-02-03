import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, StatusBar, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, ThemedTextSecondary, ThemedView } from "@themes/themedComponents";
import { router, useFocusEffect } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { NoticeBoardIcon } from "@/components/icons";
import { useTheme } from "@/contexts/themeContext";
import { useResidence } from "@/contexts/residenceContext";
import { useAuth } from "@/contexts/authContext";
import { getSocietyNoticesForUser } from "@/api/services/notice.service";
import { Notice } from "@/api/interfaces/notice.interface";
import NoticeCard from "@/components/manager/NoticeCard";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import FilterSortBar, {
  SortOption,
  FilterCategory,
} from "@/components/widgets/FilterSortBar";
import NoticeBottomSheet, { NoticeBottomSheetRef } from "./noticeBottomSheet";

const SORT_OPTIONS: SortOption[] = [
  {
    label: "Newest First",
    value: "newest",
    isDefault: true,
    shortLabel: "Newest",
  },
  { label: "Oldest First", value: "oldest", shortLabel: "Oldest" },
  { label: "Title (A-Z)", value: "title_asc", shortLabel: "A-Z" },
  { label: "Title (Z-A)", value: "title_desc", shortLabel: "Z-A" },
];

const FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: "category",
    label: "Category",
    options: [
      { label: "General", value: "general" },
      { label: "Maintenance", value: "maintenance" },
      { label: "Event", value: "event" },
      { label: "Emergency", value: "emergency" },
      { label: "Administrative", value: "administrative" },
    ],
  },
  {
    id: "priority",
    label: "Priority",
    options: [
      { label: "Normal", value: "normal" },
      { label: "Important", value: "important" },
      { label: "Urgent", value: "urgent" },
    ],
  },
];

const ResidentNoticeBoardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentTheme, themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const { user } = useAuth();
  const noticeBottomSheetRef = useRef<NoticeBottomSheetRef>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>(SORT_OPTIONS[0]);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});

  const filteredNotices = useMemo(() => {
    let result = [...notices];

    const categoryFilters = selectedFilters.category || [];
    const priorityFilters = selectedFilters.priority || [];

    if (categoryFilters.length > 0) {
      result = result.filter((n) => categoryFilters.includes(n.category));
    }

    if (priorityFilters.length > 0) {
      result = result.filter((n) => priorityFilters.includes(n.priority));
    }

    switch (selectedSort.value) {
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "title_asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title_desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return result;
  }, [notices, selectedFilters, selectedSort]);

  const handleFilterChange = useCallback(
    (categoryId: string, values: string[]) => {
      setSelectedFilters((prev) => ({
        ...prev,
        [categoryId]: values,
      }));
    },
    []
  );

  const handleClearAllFilters = useCallback(() => {
    setSelectedFilters({});
  }, []);

  const filterCategoriesWithCounts = useMemo<FilterCategory[]>(() => {
    const categoryCounts = {
      general: notices.filter((n) => n.category === "general").length,
      maintenance: notices.filter((n) => n.category === "maintenance").length,
      event: notices.filter((n) => n.category === "event").length,
      emergency: notices.filter((n) => n.category === "emergency").length,
      administrative: notices.filter((n) => n.category === "administrative").length,
    };

    const priorityCounts = {
      normal: notices.filter((n) => n.priority === "normal").length,
      important: notices.filter((n) => n.priority === "important").length,
      urgent: notices.filter((n) => n.priority === "urgent").length,
    };

    return FILTER_CATEGORIES.map((cat) => ({
      ...cat,
      options: cat.options.map((opt) => ({
        ...opt,
        count:
          cat.id === "category"
            ? categoryCounts[opt.value as keyof typeof categoryCounts]
            : priorityCounts[opt.value as keyof typeof priorityCounts],
      })),
    }));
  }, [notices]);

  const fetchNotices = useCallback(async () => {
    if (!currentResidence?.society?.id || !user?.id) return;
    
    try {
      const { data, error } = await getSocietyNoticesForUser(
        currentResidence.society.id,
        user.id
      );
      if (data) {
        const publishedNotices = data.filter((n) => n.status === "published");
        setNotices(publishedNotices);
      } else {
        console.error("Error fetching notices:", error);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentResidence?.society?.id, user?.id]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  useFocusEffect(
    useCallback(() => {
      fetchNotices();
    }, [fetchNotices])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotices();
  };

  const handleNoticePress = (notice: Notice) => {
    noticeBottomSheetRef.current?.open(notice);
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-4">
      {!isLoading ? (
        <>
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: themedColors.cardBackground }}
          >
            <NoticeBoardIcon
              width={36}
              height={36}
              color={themedColors.accent}
            />
          </View>
          <ThemedText className="text-xl font-uber-move-medium text-center mb-2">
            No Notices Yet
          </ThemedText>
          <ThemedTextSecondary className="text-sm font-lato-regular text-center">
            There are no notices at the moment
          </ThemedTextSecondary>
        </>
      ) : null}
    </View>
  );

  const renderNoticeItem = ({ item }: { item: Notice }) => (
    <NoticeCard notice={item} onPress={() => handleNoticePress(item)} />
  );

  const ListHeaderComponent = () => (
    <View className="pb-2 mb-3 -mx-3">
      <ThemedHeaderWithBack
        onBackPress={() => router.back()}
        title="notice board"
      />

      <View className="mt-6 -mx-3">
        <FilterSortBar
          sortOptions={SORT_OPTIONS}
          selectedSort={selectedSort}
          onSortChange={(value) => {
            const option = SORT_OPTIONS.find((o) => o.value === value);
            if (option) setSelectedSort(option);
          }}
          filterCategories={filterCategoriesWithCounts}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClearAllFilters={handleClearAllFilters}
          showResultCount={true}
          resultCount={filteredNotices.length}
          resultLabel="Notice"
        />
      </View>
    </View>
  );

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      {isLoading && !isRefreshing && (
        <LoadingOverlay currentTheme={currentTheme} withToast={false}/>
      )}

      <View style={{ marginTop: insets.top }} className="flex-1">
        <FlatList
          data={filteredNotices}
          renderItem={renderNoticeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingBottom: insets.bottom + 20,
            flexGrow: 1,
          }}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={themedColors.accent}
            />
          }
        />
      </View>

      <NoticeBottomSheet ref={noticeBottomSheetRef} />
    </ThemedView>
  );
};

export default ResidentNoticeBoardScreen;
