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
} from "@themes/themedComponents";
import { router, useFocusEffect } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { useResidence } from "@/contexts/residenceContext";
import { useAuth } from "@/contexts/authContext";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { getResidenceAndSocietyComplaints, voteComplaint, removeVote } from "@/api/services/complaint.service";
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
  ThumbsUpIcon,
  ThumbsDownIcon,
  HomeIcon,
  BuildingIcon,
} from "@/components/icons";
import { Complaint, VoteType } from "@/api/interfaces/complaint.interface";
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

const LEVELS = ["resident", "society"] as const;

const SORT_OPTIONS: SortOption[] = [
  {
    label: "Newest First",
    value: "newest",
    isDefault: true,
    shortLabel: "Newest",
  },
  { label: "Oldest First", value: "oldest", shortLabel: "Oldest" },
  { label: "Most Upvoted", value: "most_upvoted", shortLabel: "Top" },
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
    id: "level",
    label: "Level",
    options: [
      { label: "Residence", value: "resident" },
      { label: "Society", value: "society" },
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
    const levelFilters = selectedFilters.level || [];

    if (statusFilters.length > 0) {
      result = result.filter((c) => statusFilters.includes(c.status));
    }

    if (categoryFilters.length > 0) {
      result = result.filter((c) => categoryFilters.includes(c.category));
    }

    if (levelFilters.length > 0) {
      result = result.filter((c) => levelFilters.includes(c.level));
    }

    switch (selectedSort.value) {
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "most_upvoted":
        result.sort((a, b) => {
          const aScore = (a.upvotes || 0) - (a.downvotes || 0);
          const bScore = (b.upvotes || 0) - (b.downvotes || 0);
          return bScore - aScore;
        });
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

    const levelCounts = {
      resident: complaints.filter((c) => c.level === "resident").length,
      society: complaints.filter((c) => c.level === "society").length,
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
          cat.id === "status"
            ? statusCounts[opt.value as keyof typeof statusCounts]
            : cat.id === "level"
            ? levelCounts[opt.value as keyof typeof levelCounts]
            : categoryCounts[opt.value],
      })),
    }));
  }, [complaints]);

  const fetchComplaints = useCallback(async () => {
    if (!currentResidence || !user?.id) return;

    try {
      const { data, error } = await getResidenceAndSocietyComplaints(user.id, currentResidence.society_id);

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

  const handleVote = async (complaintId: string, voteType: VoteType) => {
    if (!user?.id) return;

    const complaint = complaints.find((c) => c.id === complaintId);
    if (!complaint) return;

    try {
      if (complaint.user_vote === voteType) {
        await removeVote(complaintId, user.id);
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === complaintId
              ? {
                  ...c,
                  user_vote: null,
                  upvotes: voteType === "upvote" ? (c.upvotes || 1) - 1 : c.upvotes,
                  downvotes: voteType === "downvote" ? (c.downvotes || 1) - 1 : c.downvotes,
                }
              : c
          )
        );
      } else {
        await voteComplaint(complaintId, user.id, voteType);
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === complaintId
              ? {
                  ...c,
                  user_vote: voteType,
                  upvotes:
                    voteType === "upvote"
                      ? (c.upvotes || 0) + 1
                      : c.user_vote === "upvote"
                      ? (c.upvotes || 1) - 1
                      : c.upvotes,
                  downvotes:
                    voteType === "downvote"
                      ? (c.downvotes || 0) + 1
                      : c.user_vote === "downvote"
                      ? (c.downvotes || 1) - 1
                      : c.downvotes,
                }
              : c
          )
        );
      }

      if (selectedComplaint?.id === complaintId) {
        setSelectedComplaint((prev) =>
          prev
            ? {
                ...prev,
                user_vote: complaint.user_vote === voteType ? null : voteType,
                upvotes:
                  complaint.user_vote === voteType
                    ? voteType === "upvote"
                      ? (prev.upvotes || 1) - 1
                      : prev.upvotes
                    : voteType === "upvote"
                    ? (prev.upvotes || 0) + 1
                    : prev.user_vote === "upvote"
                    ? (prev.upvotes || 1) - 1
                    : prev.upvotes,
                downvotes:
                  complaint.user_vote === voteType
                    ? voteType === "downvote"
                      ? (prev.downvotes || 1) - 1
                      : prev.downvotes
                    : voteType === "downvote"
                    ? (prev.downvotes || 0) + 1
                    : prev.user_vote === "downvote"
                    ? (prev.downvotes || 1) - 1
                    : prev.downvotes,
              }
            : null
        );
      }
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to vote");
    }
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

  const getLevelIcon = (level: string) => {
    const iconProps = { width: 12, height: 12 };
    if (level === "society") {
      return {
        icon: <BuildingIcon {...iconProps} color={basicColors.blue} />,
        label: "Society",
        color: basicColors.blue,
      };
    }
    return {
      icon: <HomeIcon {...iconProps} color={basicColors.purple} />,
      label: "Residence",
      color: basicColors.purple,
    };
  };

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
    const { label: levelLabel } = getLevelIcon(item.level);
    const isLastItem = index === filteredComplaints.length - 1;

    return (
      <>
        <TouchableOpacity
          onPress={() => handleComplaintPress(item)}
          className="pt-2 pb-5 px-1"
          activeOpacity={0.6}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <ThemedTextSecondary className="text-xs font-uber-move-medium capitalize">
                {levelLabel}
              </ThemedTextSecondary>
              <View
                className="w-1 h-1 rounded-full mx-2"
                style={{ backgroundColor: themedColors.secondaryText + "40" }}
              />
              <ThemedTextSecondary className="text-xs font-uber-move-medium">
                {item.category}
              </ThemedTextSecondary>
            </View>

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

          <ThemedText
            className="text-base font-uber-move-medium leading-6 mb-2"
            numberOfLines={2}
          >
            {item.title}
          </ThemedText>

          {item.description && (
            <ThemedTextSecondary
              className="text-sm font-lato-regular leading-5 mb-4"
              numberOfLines={2}
            >
              {item.description}
            </ThemedTextSecondary>
          )}

          <ThemedTextSecondary className="text-xs font-lato-regular mb-4">
            {format(new Date(item.created_at), "dd MMM yyyy, hh:mm a")}
          </ThemedTextSecondary>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleVote(item.id, "upvote");
              }}
              className="flex-row items-center p-1.5 rounded-md mr-3"
              style={{
                backgroundColor:
                  item.user_vote === "upvote"
                    ? basicColors.brightGreen + "20"
                    : themedColors.secondaryText + "10",
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ThumbsUpIcon
                width={14}
                height={14}
                color={item.user_vote === "upvote" ? basicColors.brightGreen : themedColors.secondaryText}
                filled={item.user_vote === "upvote"}
              />
              <ThemedTextSecondary className="text-xs font-uber-move-medium ml-1">
                {item.upvotes || 0}
              </ThemedTextSecondary>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleVote(item.id, "downvote");
              }}
              className="flex-row items-center p-1.5 rounded-md"
              style={{
                backgroundColor:
                  item.user_vote === "downvote"
                    ? basicColors.red + "20"
                    : themedColors.secondaryText + "10",
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ThumbsDownIcon
                width={14}
                height={14}
                color={item.user_vote === "downvote" ? basicColors.red : themedColors.secondaryText}
                filled={item.user_vote === "downvote"}
              />
              <ThemedTextSecondary className="text-xs font-uber-move-medium ml-1">
                {item.downvotes || 0}
              </ThemedTextSecondary>
            </TouchableOpacity>
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
                const { icon: CategoryIcon, color: categoryColor } =
                  getCategoryIcon(selectedComplaint.category);
                const { icon: LevelIcon, label: levelLabel, color: levelColor } =
                  getLevelIcon(selectedComplaint.level);
                const statusColor =
                  selectedComplaint.status === "open"
                    ? basicColors.gold
                    : basicColors.green;
                const voteScore = (selectedComplaint.upvotes || 0) - (selectedComplaint.downvotes || 0);

                return (
                  <View className="px-6 pt-2">
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center">
                        {React.cloneElement(LevelIcon, {
                          width: 14,
                          height: 14,
                          color: levelColor,
                        })}
                        <ThemedTextSecondary className="text-sm font-uber-move-medium ml-1.5 capitalize">
                          {levelLabel}
                        </ThemedTextSecondary>
                        <View
                          className="w-1 h-1 rounded-full mx-2"
                          style={{ backgroundColor: themedColors.secondaryText + "40" }}
                        />
                        {React.cloneElement(CategoryIcon, {
                          width: 14,
                          height: 14,
                          color: categoryColor,
                        })}
                        <ThemedTextSecondary className="text-sm font-uber-move-medium ml-1.5">
                          {selectedComplaint.category}
                        </ThemedTextSecondary>
                      </View>

                      <View className="flex-row items-center">
                        <View
                          className="w-2 h-2 rounded-full mr-1.5"
                          style={{ backgroundColor: statusColor }}
                        />
                        <ThemedTextSecondary className="text-sm font-uber-move-medium capitalize">
                          {selectedComplaint.status}
                        </ThemedTextSecondary>
                      </View>
                    </View>

                    <ThemedText className="text-xl font-uber-move-medium leading-7 mb-6">
                      {selectedComplaint.title}
                    </ThemedText>

                    {selectedComplaint.description && (
                      <ThemedText className="text-base font-lato-regular leading-6 mb-6">
                        {selectedComplaint.description}
                      </ThemedText>
                    )}

                    <View className="flex items-start mb-4">
                      {selectedComplaint.raised_by_name && (
                        <>
                          <ThemedTextSecondary className="text-sm font-lato-regular">
                            {selectedComplaint.raised_by_name}
                          </ThemedTextSecondary>
                        </>
                      )}
                      <ThemedTextSecondary className="text-sm font-lato-regular mt-2">
                        {format(
                          new Date(selectedComplaint.created_at),
                          "dd MMM yyyy, hh:mm a"
                        )}
                      </ThemedTextSecondary>
                    </View>

                    <View className="flex-row items-center justify-end mb-6">
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          onPress={() => handleVote(selectedComplaint.id, "upvote")}
                          className="flex-row items-center p-2 rounded-lg mr-3"
                          style={{
                            backgroundColor:
                              selectedComplaint.user_vote === "upvote"
                                ? basicColors.brightGreen + "20"
                                : themedColors.secondaryText + "10",
                          }}
                        >
                          <ThumbsUpIcon
                            width={18}
                            height={18}
                            color={
                              selectedComplaint.user_vote === "upvote"
                                ? basicColors.brightGreen
                                : themedColors.secondaryText
                            }
                            filled={selectedComplaint.user_vote === "upvote"}
                          />
                          <ThemedTextSecondary className="text-sm font-uber-move-medium ml-1.5">
                            {selectedComplaint.upvotes || 0}
                          </ThemedTextSecondary>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleVote(selectedComplaint.id, "downvote")}
                          className="flex-row items-center p-2 rounded-lg"
                          style={{
                            backgroundColor:
                              selectedComplaint.user_vote === "downvote"
                                ? basicColors.red + "20"
                                : themedColors.secondaryText + "10",
                          }}
                        >
                          <ThumbsDownIcon
                            width={18}
                            height={18}
                            color={
                              selectedComplaint.user_vote === "downvote"
                                ? basicColors.red
                                : themedColors.secondaryText
                            }
                            filled={selectedComplaint.user_vote === "downvote"}
                          />
                          <ThemedTextSecondary className="text-sm font-uber-move-medium ml-1.5">
                            {selectedComplaint.downvotes || 0}
                          </ThemedTextSecondary>
                        </TouchableOpacity>
                      </View>
                    </View>
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
