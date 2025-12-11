import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    StatusBar,
    View,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Image,
    Dimensions,
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
import { UnifiedGuestHistoryEntry } from "@/types/models/visitor";
import { getGuestHistory } from "@/api/services/visitor.service";
import { showErrorToast } from "@/utils/toast";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import {
    CheckCircleIcon,
    ClockFiveIcon,
    TrendIcon,
    CalendarIcon,
    HistoryIcon,
    ArrowIcon,
} from "@/components/icons";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import EmptyStateView from "@/components/widgets/EmptyStateView";
import colorMapping from "@themes/colors";
import emptyViewImage from "@assets/images/girl-empty-box.png";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import basicColors from "@themes/colors";
import Divider from "@/components/widgets/Divider";

type FilterOption = "today" | "week" | "month" | "all";
type StatusFilter = "all" | "inside" | "exited";

const GuestHistoryScreen: React.FC = () => {
    const { themedColors, currentTheme } = useTheme();
    const { currentResidence } = useResidence();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);

    const [logs, setLogs] = useState<UnifiedGuestHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [timeFilter, setTimeFilter] = useState<FilterOption>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [selectedLog, setSelectedLog] = useState<UnifiedGuestHistoryEntry | null>(null);

    const filteredLogs = useMemo(() => {
        const now = new Date();
        
        return logs.filter((log) => {
            const entryTime = new Date(log.entry_time);
            const isStillInside = !log.exit_time;
            
            let passesTimeFilter = true;
            if (timeFilter === "today") {
                passesTimeFilter = isWithinInterval(entryTime, {
                    start: startOfDay(now),
                    end: endOfDay(now),
                });
            } else if (timeFilter === "week") {
                passesTimeFilter = isWithinInterval(entryTime, {
                    start: startOfDay(subDays(now, 7)),
                    end: endOfDay(now),
                });
            } else if (timeFilter === "month") {
                passesTimeFilter = isWithinInterval(entryTime, {
                    start: startOfDay(subDays(now, 30)),
                    end: endOfDay(now),
                });
            }

            let passesStatusFilter = true;
            if (statusFilter === "inside") {
                passesStatusFilter = isStillInside;
            } else if (statusFilter === "exited") {
                passesStatusFilter = !isStillInside;
            }

            return passesTimeFilter && passesStatusFilter;
        }).sort((a, b) => 
            new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime()
        );
    }, [logs, timeFilter, statusFilter]);

    const fetchHistory = useCallback(async () => {
        if (!currentResidence) return;

        try {
            const { data, error } = await getGuestHistory(currentResidence.id);
            console.log(data, error);
            if (error) throw error;
            setLogs(data || []);
        } catch (error: any) {
            showErrorToast(error?.message || "Failed to fetch guest history");
        }
    }, [currentResidence]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchHistory();
            setIsLoading(false);
        };
        loadData();
    }, [fetchHistory]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchHistory();
        setIsRefreshing(false);
    };

    const handleLogPress = (log: UnifiedGuestHistoryEntry) => {
        setSelectedLog(log);
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
        value: FilterOption | StatusFilter,
        currentValue: FilterOption | StatusFilter,
        onPress: () => void,
        icon?: React.ReactNode
    ) => {
        const isActive = value === currentValue;
        return (
            <TouchableOpacity
                onPress={onPress}
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

    const renderLogCard = ({ item }: { item: UnifiedGuestHistoryEntry }) => {
        const entryTime = new Date(item.entry_time);
        const isStillInside = !item.exit_time;
        const isWalkIn = item.type === "walk_in";

        return (
            <TouchableOpacity
                onPress={() => handleLogPress(item)}
                className="rounded-md mb-3 p-4"
                style={{
                    backgroundColor: themedColors.cardBackground,
                    borderColor: themedColors.lightBorder,
                    borderWidth: 0.5,
                }}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                        <View className="flex-row items-center gap-2">
                            <ThemedText
                                className="text-base font-uber-move-medium tracking-wide"
                                numberOfLines={1}
                            >
                                {item.visitor_name}
                            </ThemedText>
                            {isWalkIn && (
                                <View
                                    className="px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: basicColors.gold + "20" }}
                                >
                                    <ThemedText
                                        className="text-[10px] font-uber-move-bold uppercase"
                                        style={{ color: basicColors.gold }}
                                    >
                                        Walk-in
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                        <ThemedTextSecondary className="text-sm font-lato-regular mt-1">
                            {format(entryTime, "dd MMM, hh:mm a")}
                        </ThemedTextSecondary>
                    </View>
                    <View className="flex-row items-center gap-3">
                        {isStillInside ? (
                            <View
                                className="px-2.5 py-1 rounded-full flex-row items-center"
                                style={{ backgroundColor: themedColors.success + "20" }}
                            >
                                <View
                                    className="w-1.5 h-1.5 rounded-full mr-1.5"
                                    style={{ backgroundColor: themedColors.success }}
                                />
                                <ThemedText
                                    className="text-xs font-uber-move-medium"
                                    style={{ color: "#10b981" }}
                                >
                                    Inside
                                </ThemedText>
                            </View>
                        ) : (
                            <View
                                className="px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: themedColors.secondaryText + "20" }}
                            >
                                <ThemedText
                                    className="text-xs font-uber-move-medium"
                                    style={{ color: themedColors.secondaryText }}
                                >
                                    Exited
                                </ThemedText>
                            </View>
                        )}
                        <View style={{ transform: [{ rotate: "-90deg" }] }}>
                            <ArrowIcon
                                width={16}
                                height={16}
                                stroke={themedColors.secondaryText}
                            />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const ListHeaderComponent = () => (
      <View className="pb-2 mb-3 -mx-3">
        <ThemedHeaderWithBack
          onBackPress={() => router.back()}
          title="guest history"
        />

        <View className="mt-6 mx-3">
          <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider mb-3">
            Time Period
          </ThemedTextSecondary>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
            className="-mx-5 px-5"
          >
            {renderFilterChip(
              "All Time",
              "all",
              timeFilter,
              () => setTimeFilter("all"),
              <HistoryIcon
                width={12}
                height={12}
                color={
                  timeFilter === "all"
                    ? themedColors.textOnAccent
                    : themedColors.text
                }
              />
            )}
            {renderFilterChip(
              "Today",
              "today",
              timeFilter,
              () => setTimeFilter("today"),
              <CalendarIcon
                width={12}
                height={12}
                color={
                  timeFilter === "today"
                    ? themedColors.textOnAccent
                    : themedColors.text
                }
              />
            )}
            {renderFilterChip(
              "This Week",
              "week",
              timeFilter,
              () => setTimeFilter("week"),
              <TrendIcon
                width={12}
                height={12}
                color={
                  timeFilter === "week"
                    ? themedColors.textOnAccent
                    : themedColors.text
                }
              />
            )}
            <View className="mr-5">
              {renderFilterChip(
                "This Month",
                "month",
                timeFilter,
                () => setTimeFilter("month"),
                <CalendarIcon
                  width={12}
                  height={12}
                  color={
                    timeFilter === "month"
                      ? themedColors.textOnAccent
                      : themedColors.text
                  }
                />
              )}
            </View>
          </ScrollView>
        </View>

        <View className="mt-5 mx-3">
          <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider mb-3">
            Status
          </ThemedTextSecondary>
          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {renderFilterChip("All", "all", statusFilter, () =>
              setStatusFilter("all")
            )}
            {renderFilterChip(
              "Currently Inside",
              "inside",
              statusFilter,
              () => setStatusFilter("inside"),
              <View
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    statusFilter === "inside"
                      ? themedColors.textOnAccent
                      : themedColors.success,
                }}
              />
            )}
            {renderFilterChip(
              "Exited",
              "exited",
              statusFilter,
              () => setStatusFilter("exited"),
              <CheckCircleIcon
                width={12}
                height={12}
                color={
                  statusFilter === "exited"
                    ? themedColors.textOnAccent
                    : themedColors.text
                }
              />
            )}
          </View>
        </View>

        <Divider className="mt-8" />

        {filteredLogs.length > 0 && (
          <View className="mt-8 mx-3">
            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider">
              {filteredLogs.length}{" "}
              {filteredLogs.length === 1 ? "Record" : "Records"} Found
            </ThemedTextSecondary>
          </View>
        )}
      </View>
    );

    return (
      <ThemedView className="flex-1">
        <StatusBar barStyle="default" animated />
        {isLoading && <LoadingOverlay currentTheme={currentTheme} />}
        <View
          className="flex-1"
          style={{
            marginTop: insets.top,
          }}
        >
          <FlatList
            data={filteredLogs}
            renderItem={renderLogCard}
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
                    title="No guest history"
                    subtitle1="Guest entry/exit records will appear here"
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
                paddingBottom: insets.bottom + 24,
              }}
            >
              {selectedLog && (
                <View className="px-6 pt-4">
                  <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-1">
                      <ThemedText className="text-lg font-uber-move-medium tracking-wide">
                        {selectedLog.visitor_name}
                      </ThemedText>
                      {selectedLog.visitor_phone && (
                        <ThemedTextSecondary className="text-sm font-lato-regular mt-1">
                          {formatPhoneForDisplay(selectedLog.visitor_phone)}
                        </ThemedTextSecondary>
                      )}
                    </View>
                    <View className="items-end gap-2">
                      {selectedLog.type === "walk_in" && (
                        <View
                          className="px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: basicColors.gold + "20" }}
                        >
                          <ThemedText
                            className="text-xs font-uber-move-bold uppercase tracking-wider"
                            style={{ color: basicColors.gold }}
                          >
                            Walk-in
                          </ThemedText>
                        </View>
                      )}
                      {!selectedLog.exit_time && (
                        <View
                          className="px-3 py-1.5 rounded-full flex-row items-center"
                          style={{
                            backgroundColor: themedColors.success + "20",
                          }}
                        >
                          <View
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: themedColors.success }}
                          />
                          <ThemedText
                            className="text-xs font-uber-move-bold uppercase tracking-wider"
                            style={{ color: themedColors.success }}
                          >
                            Inside
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="p-4">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider mb-1">
                          {selectedLog.pass_code ? "Pass Code" : "Entry Type"}
                        </ThemedTextSecondary>
                        <ThemedText className="text-base font-uber-move-medium tracking-[3px]">
                          {selectedLog.pass_code ||
                            (selectedLog.type === "walk_in"
                              ? "WALK-IN"
                              : "N/A")}
                        </ThemedText>
                      </View>
                      <View className="items-end">
                        <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider mb-1">
                          Entry Method
                        </ThemedTextSecondary>
                        <ThemedText className="text-sm font-uber-move-medium capitalize">
                          {selectedLog.entry_method.replace(/_/g, " ")}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <ThemedHR className="mb-2" />
                  <View className="p-4">
                    <View className="flex-row">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <CheckCircleIcon
                            width={12}
                            height={12}
                            color={themedColors.success}
                          />
                          <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider ml-1">
                            Entry
                          </ThemedTextSecondary>
                        </View>
                        <ThemedText className="text-base font-uber-move-medium tracking-wide">
                          {format(
                            new Date(selectedLog.entry_time),
                            "dd MMM yyyy"
                          )}
                        </ThemedText>
                        <ThemedTextSecondary className="text-sm font-lato-regular mt-0.5">
                          {format(new Date(selectedLog.entry_time), "hh:mm a")}
                        </ThemedTextSecondary>
                        {selectedLog.entry_gate && (
                          <ThemedTextSecondary className="text-xs font-lato-regular mt-1">
                            Gate: {selectedLog.entry_gate}
                          </ThemedTextSecondary>
                        )}
                      </View>
                      <View
                        className="w-px mx-4"
                        style={{ backgroundColor: themedColors.lightBorder }}
                      />
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          {selectedLog.exit_time ? (
                            <CheckCircleIcon
                              width={12}
                              height={12}
                              color={themedColors.error}
                            />
                          ) : (
                            <ClockFiveIcon
                              width={12}
                              height={12}
                              color={themedColors.secondaryText}
                            />
                          )}
                          <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider ml-1">
                            Exit
                          </ThemedTextSecondary>
                        </View>
                        {selectedLog.exit_time ? (
                          <>
                            <ThemedText className="text-base font-uber-move-medium tracking-wide">
                              {format(
                                new Date(selectedLog.exit_time),
                                "dd MMM yyyy"
                              )}
                            </ThemedText>
                            <ThemedTextSecondary className="text-sm font-lato-regular mt-0.5">
                              {format(
                                new Date(selectedLog.exit_time),
                                "hh:mm a"
                              )}
                            </ThemedTextSecondary>
                            {selectedLog.exit_gate && (
                              <ThemedTextSecondary className="text-xs font-lato-regular mt-1">
                                Gate: {selectedLog.exit_gate}
                              </ThemedTextSecondary>
                            )}
                          </>
                        ) : (
                          <ThemedText
                            className="text-base font-uber-move-medium tracking-wide"
                            style={{ color: themedColors.success }}
                          >
                            Still inside
                          </ThemedText>
                        )}
                      </View>
                    </View>
                  </View>

                  {(selectedLog.purpose ||
                    selectedLog.vehicle_number ||
                    selectedLog.guard_notes) && (
                    <>
                      <ThemedHR className="mb-2 mt-1" />
                      <View className="p-4">
                        {selectedLog.purpose && (
                          <View className="mb-3">
                            <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider mb-1">
                              Purpose
                            </ThemedTextSecondary>
                            <ThemedText className="text-sm font-uber-move-medium capitalize">
                              {selectedLog.purpose}
                            </ThemedText>
                          </View>
                        )}
                        {selectedLog.vehicle_number && (
                          <View
                            className={selectedLog.guard_notes ? "mb-3" : ""}
                          >
                            <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider mb-1">
                              Vehicle Number
                            </ThemedTextSecondary>
                            <ThemedText className="text-sm font-uber-move-medium uppercase">
                              {selectedLog.vehicle_number}
                            </ThemedText>
                          </View>
                        )}
                        {selectedLog.guard_notes && (
                          <View>
                            <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider mb-1">
                              Guard Notes
                            </ThemedTextSecondary>
                            <ThemedText className="text-sm font-uber-move-medium">
                              {selectedLog.guard_notes}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </>
                  )}
                </View>
              )}
            </BottomSheetView>
          </BottomSheet>
        </Portal>
      </ThemedView>
    );
};

export default GuestHistoryScreen;
