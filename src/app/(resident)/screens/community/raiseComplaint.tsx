import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  StatusBar,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
  ThemedHR,
} from "@themes/themedComponents";
import { router, useFocusEffect } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { useResidence } from "@/contexts/residenceContext";
import { useAuth } from "@/contexts/authContext";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { getUserComplaints } from "@/api/services/complaint.service";
import { showErrorToast } from "@/utils/toast";
import { format } from "date-fns";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import EmptyStateView from "@/components/widgets/EmptyStateView";
import emptyViewImage from "@assets/images/girl-empty-box.png";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import basicColors from "@themes/colors";
import {
  ComplaintIcon,
  ArrowIcon,
  PlusIcon,
  BroomIcon,
  BoltIcon,
  SecurityGateIcon,
  UserPlumberIcon,
} from "@/components/icons";
import { Complaint } from "@/api/interfaces/complaint.interface";
import { ROUTES } from "@/constants/routes";
import FilterSortBar, {
  SortOption,
  FilterCategory,
} from "@/components/widgets/FilterSortBar";
import Divider from "@/components/widgets/Divider";

const CATEGORIES = [
  "General",
  "Plumbing",
  "Electrical",
  "Security",
  "Cleaning",
] as const;

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
    id: "status",
    label: "Status",
    options: [
      { label: "Open", value: "open" },
      { label: "Closed", value: "closed" },
    ],
  },
  {
    id: "category",
    label: "Category",
    options: CATEGORIES.map((cat) => ({ label: cat, value: cat })),
  },
];

const RaiseComplaintScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const detailsBottomSheetRef = useRef<BottomSheet>(null);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>(SORT_OPTIONS[0]);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );

  const filteredComplaints = useMemo(() => {
    let result = [...complaints];

    const statusFilters = selectedFilters.status || [];
    const categoryFilters = selectedFilters.category || [];

    if (statusFilters.length > 0) {
      result = result.filter((c) => statusFilters.includes(c.status));
    }

    if (categoryFilters.length > 0) {
      result = result.filter((c) => categoryFilters.includes(c.category));
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
  }, [complaints, selectedFilters, selectedSort]);

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
    const statusCounts = {
      open: complaints.filter((c) => c.status === "open").length,
      closed: complaints.filter((c) => c.status === "closed").length,
    };

    const categoryCounts = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = complaints.filter((c) => c.category === cat).length;
      return acc;
    }, {} as Record<string, number>);

    return FILTER_CATEGORIES.map((cat) => ({
      ...cat,
      options: cat.options.map((opt) => ({
        ...opt,
        count:
          opt.value === "open" ? statusCounts.open : categoryCounts[opt.value],
      })),
    }));
  }, [complaints]);

  const fetchComplaints = useCallback(async () => {
    if (!currentResidence || !user?.id) return;

    try {
      const { data, error } = await getUserComplaints(user.id);

      if (error) throw error;
      setComplaints(data || []);
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to fetch complaints");
    }
  }, [currentResidence, user]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchComplaints();
      setIsLoading(false);
    };
    loadData();
  }, [fetchComplaints]);

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchComplaints();
    setIsRefreshing(false);
  };

  const handleOpenCreateScreen = () => {
    router.push(ROUTES.RESIDENT.SCREENS.COMMUNITY.CREATE_COMPLAINT);
  };

  const handleComplaintPress = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    detailsBottomSheetRef.current?.expand();
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

  const getCategoryIcon = (category: string) => {
    const iconProps = { width: 14, height: 14 };
    switch (category) {
      case "Plumbing":
        return {
          icon: <UserPlumberIcon {...iconProps} color={basicColors.blue} />,
          color: basicColors.blue,
        };
      case "Electrical":
        return {
          icon: <BoltIcon {...iconProps} color={basicColors.gold} />,
          color: basicColors.gold,
        };
      case "Security":
        return {
          icon: <SecurityGateIcon {...iconProps} color={basicColors.red} />,
          color: basicColors.red,
        };
      case "Cleaning":
        return {
          icon: <BroomIcon {...iconProps} color={basicColors.teal} />,
          color: basicColors.teal,
        };
      case "General":
      default:
        return {
          icon: <ComplaintIcon {...iconProps} color={basicColors.purple} />,
          color: basicColors.pink,
        };
    }
  };

  const renderComplaintCard = ({
    item,
    index,
  }: {
    item: Complaint;
    index: number;
  }) => {
    const statusColor =
      item.status === "open" ? basicColors.gold : basicColors.green;
    const { icon: CategoryIcon } = getCategoryIcon(item.category);
    const isLastItem = index === filteredComplaints.length - 1;

    return (
      <>
        <TouchableOpacity
          onPress={() => handleComplaintPress(item)}
          className="pt-2 pb-5 px-1"
          activeOpacity={0.6}
        >
          {/* Header: Title + Status */}
          <View className="flex-row items-start justify-between mb-3">
            <ThemedText
              className="text-base font-uber-move-medium leading-6 flex-1 mr-4"
              numberOfLines={2}
            >
              {item.title}
            </ThemedText>

            <View className="flex-row items-center">
              <View
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: statusColor }}
              />
              <ThemedTextSecondary className="text-xs font-uber-move-medium uppercase">
                {item.status}
              </ThemedTextSecondary>
            </View>
          </View>

          {/* Description */}
          {item.description && (
            <ThemedTextSecondary
              className="text-sm font-lato-regular leading-5 mb-4"
              numberOfLines={2}
            >
              {item.description}
            </ThemedTextSecondary>
          )}

          {/* Meta: Category + Icon + Date + Arrow */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {React.cloneElement(CategoryIcon, {
                width: 14,
                height: 14,
                color: themedColors.secondaryText,
              })}
              <ThemedTextSecondary className="text-xs font-uber-move-medium ml-2">
                {item.category}
              </ThemedTextSecondary>
              <View
                className="w-1 h-1 rounded-full mx-3"
                style={{ backgroundColor: themedColors.secondaryText + "40" }}
              />
              <ThemedTextSecondary className="text-xs font-lato-regular">
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
        title="complaints"
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
          resultCount={filteredComplaints.length}
          resultLabel="Ticket"
        />
      </View>
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
          data={filteredComplaints}
          renderItem={renderComplaintCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: insets.bottom + 80,
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
                  title={
                    Object.values(selectedFilters).flat().length === 0
                      ? "No complaints"
                      : "No matching complaints"
                  }
                  subtitle1={
                    Object.values(selectedFilters).flat().length === 0
                      ? "Have an issue? Raise a complaint now."
                      : "No complaints found with the selected filters."
                  }
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

        <TouchableOpacity
          onPress={handleOpenCreateScreen}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full justify-center items-center shadow-lg"
          style={{
            backgroundColor: themedColors.accent,
            marginBottom: insets.bottom,
          }}
          activeOpacity={0.95}
        >
          <PlusIcon width={20} height={20} color={themedColors.textOnAccent} />
        </TouchableOpacity>
      </View>

      <Portal hostName="global">
        <BottomSheet
          ref={detailsBottomSheetRef}
          index={-1}
          enablePanDownToClose
          enableDynamicSizing
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
          <BottomSheetView
            style={{
              backgroundColor: themedColors.modal,
              paddingBottom: insets.bottom + 32,
            }}
          >
            {selectedComplaint &&
              (() => {
                const { icon: CategoryIcon } = getCategoryIcon(
                  selectedComplaint.category
                );
                const statusColor =
                  selectedComplaint.status === "open"
                    ? basicColors.gold
                    : basicColors.green;

                return (
                  <View className="px-6 pt-2">
                    {/* Title */}
                    <ThemedText className="text-xl font-uber-move-medium leading-7 mb-6">
                      {selectedComplaint.title}
                    </ThemedText>

                    {/* Meta row: Category, Status, Date */}
                    <View className="flex-row items-center flex-wrap gap-y-3 mb-8">
                      <View className="flex-row items-center mr-5">
                        {React.cloneElement(CategoryIcon, {
                          width: 16,
                          height: 16,
                          color: themedColors.secondaryText,
                        })}
                        <ThemedTextSecondary className="text-sm font-uber-move-medium ml-2">
                          {selectedComplaint.category}
                        </ThemedTextSecondary>
                      </View>

                      <View className="flex-row items-center mr-5">
                        <View
                          className="w-2 h-2 rounded-full mr-1.5"
                          style={{ backgroundColor: statusColor }}
                        />
                        <ThemedTextSecondary className="text-sm font-uber-move-medium capitalize">
                          {selectedComplaint.status}
                        </ThemedTextSecondary>
                      </View>

                      <ThemedTextSecondary className="text-sm font-lato-regular">
                        {format(
                          new Date(selectedComplaint.created_at),
                          "dd MMM yyyy, hh:mm a"
                        )}
                      </ThemedTextSecondary>
                    </View>

                    {/* Description */}
                    {selectedComplaint.description && (
                      <View className="mb-4">
                        <ThemedTextSecondary className="text-xs font-uber-move-medium uppercase tracking-wider mb-3">
                          Description
                        </ThemedTextSecondary>
                        <ThemedText className="text-base font-lato-regular leading-6">
                          {selectedComplaint.description}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                );
              })()}
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </ThemedView>
  );
};

export default RaiseComplaintScreen;
