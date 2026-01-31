import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedView,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { router } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { SocietyShift } from "@/types";
import { getShiftsBySocietyId } from "@api/services/shift.service";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import {
  PlusIcon,
  InfoIcon,
  EditIcon,
  ChevronDownIcon,
} from "@/components/icons";
import basicColors from "@/themes/colors";
import { appEventEmitter, AppEvents } from "@/utils/eventEmitter";

const formatTime = (time: string | null | undefined): string => {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length < 2) return time;
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
};

const ShiftCard: React.FC<{
  shift: SocietyShift;
  onPress: () => void;
}> = ({ shift, onPress }) => {
  const { themedColors } = useTheme();

  const isAllDay = !shift.start_time && !shift.end_time;
  const timeDisplay = isAllDay
    ? "All day"
    : `${formatTime(shift.start_time)} – ${formatTime(shift.end_time)}`;

  const statusColor = shift.is_active
    ? basicColors.brightGreen
    : basicColors.gray;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="rounded-lg p-3 border"
      style={{
        borderColor: themedColors.lightBorder,
        backgroundColor: themedColors.cardBackground,
        width: "48%",
        marginBottom: 16,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <ThemedText
          className="text-base font-uber-move-medium flex-1"
          numberOfLines={1}
        >
          {shift.name}
        </ThemedText>
        <View className="flex-row items-center -rotate-90">
          <ChevronDownIcon
            width={16}
            height={16}
            color={themedColors.secondaryText}
          />
        </View>
      </View>
      <ThemedTextSecondary className="text-sm" numberOfLines={1}>
        {timeDisplay}
      </ThemedTextSecondary>
      <View
        className="px-2 py-1 rounded-full mt-2 self-start"
        style={{ backgroundColor: statusColor + "20" }}
      >
        <ThemedText
          className="text-xs font-uber-move-medium"
          style={{ color: statusColor }}
        >
          {shift.is_active ? "Active" : "Inactive"}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const ManageTimingsScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const insets = useSafeAreaInsets();

  const [shifts, setShifts] = useState<SocietyShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const societyId = currentResidence?.society_id;

  const fetchShifts = useCallback(
    async (showRefresh = false) => {
      if (!societyId) return;

      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const { data, error } = await getShiftsBySocietyId(societyId);

        if (error) {
          console.error("Error fetching shifts:", error);
          setShifts([]);
          return;
        }

        setShifts(data || []);
      } catch (error) {
        console.error("Error fetching shifts:", error);
        setShifts([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [societyId],
  );

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  useEffect(() => {
    const unsubscribe = appEventEmitter.on(AppEvents.SHIFT_UPDATED, () =>
      fetchShifts(false),
    );
    return () => unsubscribe();
  }, [fetchShifts]);

  const handleRefresh = () => {
    fetchShifts(true);
  };

  const handleShiftPress = (shift: SocietyShift) => {
    router.push({
      pathname: ROUTES.MANAGER.SCREENS.SERVICES.GUARDS.EDIT_SHIFT,
      params: { shiftId: shift.id },
    } as never);
  };

  const handleAddShift = () => {
    router.push({
      pathname: ROUTES.MANAGER.SCREENS.SERVICES.GUARDS.EDIT_SHIFT,
      params: { societyId },
    } as never);
  };

  if (isLoading) {
    return (
      <ThemedView className="flex-1">
        <LoadingOverlay currentTheme={currentTheme} />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <ScrollView
        className="flex-1"
        style={{ marginTop: insets.top + 6, paddingHorizontal: 16 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={themedColors.accent}
          />
        }
      >
        <View className="-mx-2">
          <ThemedHeaderWithBack
            title="manage timings"
            onBackPress={() => router.back()}
          />
        </View>

        <View
          className="rounded-lg p-4 mt-4 mb-6 flex items-start"
          style={{ backgroundColor: themedColors.accent + "15" }}
        >
          <View style={{ marginTop: 2 }} className="flex-row items-center">
            <InfoIcon width={18} height={18} color={themedColors.accent} />
            <ThemedText
              className="text-base font-uber-move-medium ml-2"
              style={{ color: themedColors.accent }}
            >
              Template changes
            </ThemedText>
          </View>
          <View className="flex-1">
            <ThemedTextSecondary className="text-sm mt-2">
              Shifts are templates for guard assignments.{"\n"}Updating a shift
              will only affect new assignments, not existing ones.
            </ThemedTextSecondary>
          </View>
        </View>

        <View className="mt-2 flex-row flex-wrap justify-between">
          {shifts.length > 0 ? (
            shifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                onPress={() => handleShiftPress(shift)}
              />
            ))
          ) : (
            <View className="py-12 items-center w-full">
              <ThemedTextSecondary className="text-base text-center">
                No shifts defined yet.{"\n"}Create your first shift template.
              </ThemedTextSecondary>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handleAddShift}
        className="absolute w-14 h-14 rounded-full items-center justify-center shadow-lg right-6"
        style={{
          backgroundColor: themedColors.accent,
          bottom: insets.bottom + 24,
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <PlusIcon width={20} height={20} color={themedColors.textOnAccent} />
      </TouchableOpacity>
    </ThemedView>
  );
};

export default ManageTimingsScreen;
