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
import { getMaintenanceUpdates } from "@/api/services/maintenance.service";
import { showErrorToast } from "@/utils/toast";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
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
import { MaintenanceIcon } from "@/components/icons";

type FilterOption = "all" | "upcoming" | "past" | "scheduled" | "in_progress" | "completed";

const MaintenanceUpdatesScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [updates, setUpdates] = useState<MaintenanceUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [selectedUpdate, setSelectedUpdate] = useState<MaintenanceUpdate | null>(null);

  const filteredUpdates = useMemo(() => {
    const today = startOfDay(new Date());

    return updates.filter((update) => {
      if (activeFilter === "all") return true;

      if (activeFilter === "upcoming" || activeFilter === "past") {
        if (!update.scheduled_date) return false;
        const scheduledDate = new Date(update.scheduled_date);
        if (activeFilter === "upcoming") {
          return isAfter(scheduledDate, today) || format(scheduledDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
        }
        return isBefore(scheduledDate, today);
      }

      return update.status?.toLowerCase() === activeFilter;
    }).sort((a, b) => {
      const dateA = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0;
      const dateB = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0;
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

  const renderUpdateCard = ({ item }: { item: MaintenanceUpdate }) => {
    const scheduledDate = item.scheduled_date
      ? new Date(item.scheduled_date)
      : null;
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        onPress={() => handleUpdatePress(item)}
        className="rounded-md mb-3 p-4"
        style={{
          backgroundColor: themedColors.cardBackground,
          borderColor: themedColors.lightBorder,
          borderWidth: 0.5,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center gap-2">
              <ThemedText
                className="text-base font-uber-move-medium tracking-wide"
                numberOfLines={2}
              >
                {item.title}
              </ThemedText>
            </View>
            {scheduledDate && (
              <ThemedTextSecondary className="text-sm font-lato-regular mt-1">
                {format(scheduledDate, "dd MMM yyyy, hh:mm a")}
              </ThemedTextSecondary>
            )}
          </View>
          {item.status && (
            <View
              className="px-2.5 py-1 rounded-full"
              style={{ backgroundColor: statusColor + "20" }}
            >
              <ThemedText
                className="text-[10px] font-uber-move-bold uppercase tracking-wider"
                style={{ color: statusColor }}
              >
                {item.status.replace(/_/g, " ")}
              </ThemedText>
            </View>
          )}
        </View>

        {item.description && (
          <ThemedTextSecondary className="text-sm mt-3" numberOfLines={2}>
            {item.description}
          </ThemedTextSecondary>
        )}
      </TouchableOpacity>
    );
  };

  const ListHeaderComponent = () => (
    <View className="pb-2 mb-3 -mx-4">
      <ThemedHeaderWithBack
        onBackPress={() => router.back()}
        title="maintenance"
      />

      <View className="mt-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 24 }}
        >
          {renderFilterChip("All", "all")}
          {renderFilterChip(
            "Upcoming",
            "upcoming",
            <View
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  activeFilter === "upcoming"
                    ? themedColors.textOnAccent
                    : basicColors.blue,
              }}
            />
          )}
          {renderFilterChip(
            "Past",
            "past",
            <View
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  activeFilter === "past"
                    ? themedColors.textOnAccent
                    : basicColors.gray,
              }}
            />
          )}
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
        <View className="mt-6 mx-6">
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
              <View className="px-8 pt-6">
                <View className="flex-row items-start justify-between mb-4">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      className="mr-3 p-3 rounded-lg"
                      style={{ backgroundColor: getStatusColor(selectedUpdate.status) + "20" }}
                    >
                      <MaintenanceIcon
                        width={24}
                        height={24}
                        color={getStatusColor(selectedUpdate.status)}
                      />
                    </View>
                    <View className="flex-1">
                      <ThemedText className="text-lg font-uber-move-medium tracking-wide">
                        {selectedUpdate.title}
                      </ThemedText>
                    </View>
                  </View>
                  {selectedUpdate.status && (
                    <View
                      className="px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: getStatusColor(selectedUpdate.status) + "20" }}
                    >
                      <ThemedText
                        className="text-xs font-uber-move-bold uppercase tracking-wider"
                        style={{ color: getStatusColor(selectedUpdate.status) }}
                      >
                        {selectedUpdate.status.replace(/_/g, " ")}
                      </ThemedText>
                    </View>
                  )}
                </View>

                <ThemedHR className="mb-4" />

                {selectedUpdate.scheduled_date && (
                  <View className="p-4">
                    <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider mb-1">
                      Scheduled Date
                    </ThemedTextSecondary>
                    <ThemedText className="text-base font-uber-move-medium">
                      {format(new Date(selectedUpdate.scheduled_date), "EEEE, dd MMM yyyy")}
                    </ThemedText>
                    <ThemedTextSecondary className="text-sm font-lato-regular mt-0.5">
                      {format(new Date(selectedUpdate.scheduled_date), "hh:mm a")}
                    </ThemedTextSecondary>
                  </View>
                )}

                {selectedUpdate.description && (
                  <>
                    <ThemedHR className="mb-2" />
                    <View className="p-4">
                      <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider mb-2">
                        Description
                      </ThemedTextSecondary>
                      <ThemedText className="text-sm font-lato-regular leading-5">
                        {selectedUpdate.description}
                      </ThemedText>
                    </View>
                  </>
                )}

                <ThemedHR className="mb-2" />
                <View className="p-4">
                  <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider mb-1">
                    Posted On
                  </ThemedTextSecondary>
                  <ThemedText className="text-sm font-uber-move-medium">
                    {format(new Date(selectedUpdate.created_at), "dd MMM yyyy, hh:mm a")}
                  </ThemedText>
                </View>
              </View>
            )}
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </ThemedView>
  );
};

export default MaintenanceUpdatesScreen;
