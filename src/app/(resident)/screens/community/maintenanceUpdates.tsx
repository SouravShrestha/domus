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
import { getMaintenanceUpdates } from "@/api/services/maintenance.service";
import { showErrorToast } from "@/utils/toast";
import { format } from "date-fns";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import EmptyStateView from "@/components/widgets/EmptyStateView";
import emptyViewImage from "@assets/images/girl-empty-box.png";
import { MaintenanceUpdate } from "@/api/interfaces/maintenance.interface";
import basicColors from "@themes/colors";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { MaintenanceIcon, ArrowIcon } from "@/components/icons";
import Divider from "@/components/widgets/Divider";

type FilterOption = "all" | "scheduled" | "in_progress" | "completed";

const MaintenanceUpdatesScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [updates, setUpdates] = useState<MaintenanceUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [selectedUpdate, setSelectedUpdate] =
    useState<MaintenanceUpdate | null>(null);

  const filteredUpdates = useMemo(() => {
    return updates
      .filter((update) => {
        if (activeFilter === "all") return true;
        return update.status?.toLowerCase() === activeFilter;
      })
      .sort((a, b) => {
        const dateA = a.scheduled_date
          ? new Date(a.scheduled_date).getTime()
          : 0;
        const dateB = b.scheduled_date
          ? new Date(b.scheduled_date).getTime()
          : 0;
        return dateB - dateA;
      });
  }, [updates, activeFilter]);

  const fetchUpdates = useCallback(async () => {
    if (!currentResidence?.society?.id) return;

    try {
      const { data, error } = await getMaintenanceUpdates(
        currentResidence.society.id
      );
      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch updates";
      showErrorToast(message);
    }
  }, [currentResidence]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchUpdates();
      setIsLoading(false);
    };
    loadData();
  }, [fetchUpdates]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUpdates();
    setIsRefreshing(false);
  };

  const handleUpdatePress = (update: MaintenanceUpdate) => {
    setSelectedUpdate(update);
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

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return basicColors.blue;
      case "in_progress":
        return basicColors.gold;
      case "completed":
        return basicColors.green;
      default:
        return basicColors.gray;
    }
  };

  const renderFilterChip = (
    label: string,
    value: FilterOption,
    icon?: React.ReactNode
  ) => {
    const isActive = value === activeFilter;
    return (
      <TouchableOpacity
        onPress={() => setActiveFilter(value)}
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

  const renderUpdateCard = ({
    item,
    index,
  }: {
    item: MaintenanceUpdate;
    index: number;
  }) => {
    const scheduledDate = item.scheduled_date
      ? new Date(item.scheduled_date)
      : null;
    const statusColor = getStatusColor(item.status);
    const isLastItem = index === filteredUpdates.length - 1;

    return (
      <>
        <TouchableOpacity
          onPress={() => handleUpdatePress(item)}
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

            {item.status && (
              <View className="flex-row items-center">
                <View
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: statusColor }}
                />
                <ThemedTextSecondary className="text-xs font-uber-move-medium uppercase">
                  {item.status.replace(/_/g, " ")}
                </ThemedTextSecondary>
              </View>
            )}
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

          {/* Meta: Icon + Date + Arrow */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaintenanceIcon
                width={14}
                height={14}
                color={themedColors.secondaryText}
              />
              {scheduledDate && (
                <>
                  <ThemedTextSecondary className="text-xs font-uber-move-medium ml-2">
                    Scheduled
                  </ThemedTextSecondary>
                  <View
                    className="w-1 h-1 rounded-full mx-3"
                    style={{
                      backgroundColor: themedColors.secondaryText + "40",
                    }}
                  />
                  <ThemedTextSecondary className="text-xs font-lato-regular">
                    {format(scheduledDate, "dd MMM, hh:mm a")}
                  </ThemedTextSecondary>
                </>
              )}
              {!scheduledDate && (
                <ThemedTextSecondary className="text-xs font-lato-regular ml-2">
                  {format(new Date(item.created_at), "dd MMM, hh:mm a")}
                </ThemedTextSecondary>
              )}
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
        title="maintenance"
      />

      <View className="mt-6 -mx-1">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
        >
          {renderFilterChip("All", "all")}
          {renderFilterChip(
            "Scheduled",
            "scheduled",
            <View
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  activeFilter === "scheduled"
                    ? themedColors.textOnAccent
                    : basicColors.blue,
              }}
            />
          )}
          {renderFilterChip(
            "In Progress",
            "in_progress",
            <View
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  activeFilter === "in_progress"
                    ? themedColors.textOnAccent
                    : basicColors.gold,
              }}
            />
          )}
          <View className="mr-6">
            {renderFilterChip(
              "Completed",
              "completed",
              <View
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    activeFilter === "completed"
                      ? themedColors.textOnAccent
                      : basicColors.green,
                }}
              />
            )}
          </View>
        </ScrollView>
      </View>

      {filteredUpdates.length > 0 && (
        <View className="mt-10 mx-4">
          <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider">
            {filteredUpdates.length}{" "}
            {filteredUpdates.length === 1 ? "Update" : "Updates"} Found
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
          data={filteredUpdates}
          renderItem={renderUpdateCard}
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
                  title="No maintenance updates"
                  subtitle1="Everything is running smoothly."
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
            {selectedUpdate && (
              <View className="px-6 pt-2">
                {/* Title */}
                <ThemedText className="text-xl font-uber-move-medium leading-7 mb-6">
                  {selectedUpdate.title}
                </ThemedText>

                {/* Meta row: Icon, Status, Date */}
                <View className="flex-row items-center flex-wrap gap-y-3 mb-8">
                  <View className="flex-row items-center mr-5">
                    <MaintenanceIcon
                      width={16}
                      height={16}
                      color={themedColors.secondaryText}
                    />
                    <ThemedTextSecondary className="text-sm font-uber-move-medium ml-2">
                      Maintenance
                    </ThemedTextSecondary>
                  </View>

                  {selectedUpdate.status && (
                    <View className="flex-row items-center mr-5">
                      <View
                        className="w-2 h-2 rounded-full mr-1.5"
                        style={{
                          backgroundColor: getStatusColor(
                            selectedUpdate.status
                          ),
                        }}
                      />
                      <ThemedTextSecondary className="text-sm font-uber-move-medium capitalize">
                        {selectedUpdate.status.replace(/_/g, " ")}
                      </ThemedTextSecondary>
                    </View>
                  )}

                  <ThemedTextSecondary className="text-sm font-lato-regular">
                    {format(
                      new Date(
                        selectedUpdate.scheduled_date ||
                          selectedUpdate.created_at
                      ),
                      "dd MMM yyyy, hh:mm a"
                    )}
                  </ThemedTextSecondary>
                </View>

                {/* Description */}
                {selectedUpdate.description && (
                  <View className="mb-4">
                    <ThemedTextSecondary className="text-xs font-uber-move-medium uppercase tracking-wider mb-3">
                      Description
                    </ThemedTextSecondary>
                    <ThemedText className="text-base font-lato-regular leading-6">
                      {selectedUpdate.description}
                    </ThemedText>
                  </View>
                )}

                {/* Posted On (only if different from scheduled) */}
                {selectedUpdate.scheduled_date && (
                  <View className="mt-4 pt-4 border-t border-gray-200/20">
                    <ThemedTextSecondary className="text-xs font-lato-regular">
                      Posted on{" "}
                      {format(
                        new Date(selectedUpdate.created_at),
                        "dd MMM yyyy, hh:mm a"
                      )}
                    </ThemedTextSecondary>
                  </View>
                )}
              </View>
            )}
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </ThemedView>
  );
};

export default MaintenanceUpdatesScreen;
