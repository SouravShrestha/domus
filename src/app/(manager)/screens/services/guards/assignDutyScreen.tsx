import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import {
  ThemedView,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { getActiveShiftsBySocietyId } from "@api/services/shift.service";
import { getActiveGatesBySociety } from "@api/services/gate.service";
import { assignGuardDuty } from "@api/services/guard.service";
import { SocietyShift } from "@/types";
import { TriangleWarningIcon } from "@/components/icons";
import basicColors from "@/themes/colors";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { appEventEmitter, AppEvents } from "@/utils/eventEmitter";
import { ROUTES } from "@/constants/routes";
import { ProfileIcon } from "@/components/widgets/ProfileIcon";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import CustomToggle from "@/components/widgets/CustomToggle";
import Divider from "@/components/widgets/Divider";
import { SocietyGate } from "@/types/models/societyGate";

const formatTime = (time: string | null | undefined): string => {
  if (!time) return "-";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const AssignDutyScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    guardProfileId: string;
    societyId: string;
    guardName?: string;
    guardPhone?: string;
    guardPhotoUrl?: string;
  }>();

  const { guardProfileId, societyId, guardName, guardPhone, guardPhotoUrl } =
    params;

  const [gates, setGates] = useState<SocietyGate[]>([]);
  const [selectedGateIds, setSelectedGateIds] = useState<string[]>([]);
  const [shifts, setShifts] = useState<SocietyShift[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [allowAnytimeAccess, setAllowAnytimeAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!societyId) return;

    setIsLoading(true);
    try {
      const [gatesResult, shiftsResult] = await Promise.all([
        getActiveGatesBySociety(societyId),
        getActiveShiftsBySocietyId(societyId),
      ]);

      if (gatesResult.data) {
        setGates(gatesResult.data);
      }
      if (shiftsResult.data) {
        setShifts(shiftsResult.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [societyId]);

  useEffect(() => {
    fetchData();

    const unsubscribe = appEventEmitter.on(AppEvents.SHIFT_UPDATED, fetchData);
    return () => unsubscribe();
  }, [fetchData]);

  const selectedShift = shifts.find((s) => s.id === selectedShiftId);

  const handleToggleAnytimeAccess = (value: boolean) => {
    if (value) {
      Alert.alert(
        "Enable Anytime Access?",
        "This grants the guard 24/7 access to the gate controls, bypassing shift time restrictions. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enable",
            style: "destructive",
            onPress: () => setAllowAnytimeAccess(true),
          },
        ],
      );
    } else {
      setAllowAnytimeAccess(false);
    }
  };

  const handleAssignDuty = async () => {
    if (
      !guardProfileId ||
      !societyId ||
      selectedGateIds.length === 0 ||
      !selectedShiftId
    ) {
      Alert.alert("Error", "Please select at least one gate and a shift.");
      return;
    }

    const selectedGates = gates.filter((g) => selectedGateIds.includes(g.id));
    if (!selectedShift || selectedGates.length === 0) {
      Alert.alert("Error", "Selected gate(s) or shift not found.");
      return;
    }

    const gateNames = selectedGates.map((g) => g.name).join(", ");

    Alert.alert(
      "Confirm Assignment",
      `Assign ${guardName || "this guard"} to ${gateNames} for the ${selectedShift.name} shift?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Assign",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const requestModel = {
                guardProfileId,
                societyId,
                gateIds: selectedGateIds,
                shiftId: selectedShiftId,
                shiftStart: selectedShift.start_time || "00:00:00",
                shiftEnd: selectedShift.end_time || "23:59:59",
                allowAnytimeAccess,
              };
              console.log("Assign Duty Request Model:", requestModel);
              const { error } = await assignGuardDuty(requestModel);

              if (error) {
                Alert.alert("Error", error.message || "Failed to assign duty.");
                console.error("Error assigning duty:", error);
                return;
              }

              appEventEmitter.emit(AppEvents.GUARD_UPDATED);
              router.back();
            } catch (error) {
              console.error("Error assigning duty:", error);
              Alert.alert("Error", "Something went wrong. Please try again.");
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  };

  const handleAddNewShift = () => {
    router.push({
      pathname: ROUTES.MANAGER.SCREENS.SERVICES.GUARDS.EDIT_SHIFT as any,
      params: { societyId },
    });
  };

  const canSubmit = selectedGateIds.length > 0 && selectedShiftId;

  if (isLoading) {
    return (
      <ThemedView className="flex-1">
        <LoadingOverlay currentTheme={currentTheme} />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <ScrollView
        className="flex-1 px-5"
        style={{ marginTop: insets.top + 6 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="-mx-2">
          <ThemedHeaderWithBack title="assign shift" />
        </View>

        {/* Guard Details */}
        <View className="mt-3 p-4">
          <View className="flex-row items-center">
            <ProfileIcon
              username={guardName || "Guard"}
              avatarUrl={guardPhotoUrl}
              size={48}
            />
            <View className="flex-1 ml-4">
              <ThemedText className="text-lg font-uber-move-medium">
                {guardName || "Unknown Guard"}
              </ThemedText>
              {guardPhone && (
                <ThemedTextSecondary className="text-base mt-0.5">
                  {formatPhoneForDisplay(guardPhone)}
                </ThemedTextSecondary>
              )}
            </View>
          </View>
        </View>

        <Divider className="mt-3" />

        {/* Gate Selection - 2x2 Grid */}
        <View className="mt-8">
          <ThemedText className="text-base font-uber-move-medium mb-4 tracking-wider">
            Which gates?
          </ThemedText>
          <View className="flex-row flex-wrap justify-around">
            {gates.map((gate) => {
              const isSelected = selectedGateIds.includes(gate.id);

              const handleToggleGate = () => {
                setSelectedGateIds((prev) =>
                  isSelected
                    ? prev.filter((id) => id !== gate.id)
                    : [...prev, gate.id],
                );
              };

              return (
                <TouchableOpacity
                  key={gate.id}
                  onPress={handleToggleGate}
                  activeOpacity={0.7}
                  className="my-1.5 p-4 rounded-lg border items-center"
                  style={{
                    width: "47%",
                    borderColor: isSelected
                      ? themedColors.accent
                      : themedColors.lightBorder,
                    backgroundColor: isSelected
                      ? themedColors.accent + "15"
                      : themedColors.cardBackground,
                  }}
                >
                  <ThemedText
                    className="text-base font-uber-move-medium"
                    style={{
                      color: isSelected
                        ? themedColors.accent
                        : themedColors.text,
                    }}
                    numberOfLines={1}
                  >
                    {gate.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          {gates.length === 0 && (
            <ThemedTextSecondary className="text-sm text-center py-4">
              No gates found.
            </ThemedTextSecondary>
          )}
        </View>

        {/* Shift Selection - 2x2 Grid */}
        <View className="mt-8">
          <ThemedText className="text-base font-uber-move-medium mb-4 tracking-wider">
            What shift timings?
          </ThemedText>
          <View className="flex-row flex-wrap justify-around">
            {shifts.map((shift) => {
              const isSelected = selectedShiftId === shift.id;
              const timeRange =
                shift.start_time && shift.end_time
                  ? `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}`
                  : "Flexible timing";

              return (
                <TouchableOpacity
                  key={shift.id}
                  onPress={() => setSelectedShiftId(shift.id)}
                  activeOpacity={0.7}
                  className="my-1.5 p-4 rounded-lg border"
                  style={{
                    width: "47%",
                    borderColor: isSelected
                      ? themedColors.accent
                      : themedColors.lightBorder,
                    backgroundColor: isSelected
                      ? themedColors.accent + "15"
                      : themedColors.cardBackground,
                  }}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-2">
                      <ThemedText
                        className="text-base font-uber-move-medium"
                        style={{
                          color: isSelected
                            ? themedColors.accent
                            : themedColors.text,
                        }}
                        numberOfLines={1}
                      >
                        {shift.name}
                      </ThemedText>
                      <ThemedTextSecondary className="text-[13px] mt-1">
                        {timeRange}
                      </ThemedTextSecondary>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {shifts.length === 0 && (
            <ThemedTextSecondary className="text-sm text-center py-4">
              No shifts found.
            </ThemedTextSecondary>
          )}

          <TouchableOpacity
            onPress={handleAddNewShift}
            className="mt-4 self-end mx-2"
          >
            <ThemedText
              className="text-sm font-uber-move-medium border-b"
              style={{
                color: themedColors.text,
                borderColor: themedColors.text,
              }}
            >
              Don't see a shift? Add a new one here
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Allow Anytime Access Toggle */}
        <View className="mt-8">
          <TouchableOpacity
            onPress={() => handleToggleAnytimeAccess(!allowAnytimeAccess)}
            activeOpacity={0.8}
            className="flex-row items-center justify-between p-4 rounded-xl border"
            style={{
              borderColor: allowAnytimeAccess
                ? basicColors.gold
                : themedColors.lightBorder,
              backgroundColor: allowAnytimeAccess
                ? basicColors.gold + "12"
                : themedColors.cardBackground,
            }}
          >
            <View className="flex-row items-center flex-1 mr-4">
              {allowAnytimeAccess && (
                <View className="mr-3">
                  <TriangleWarningIcon
                    width={20}
                    height={20}
                    color={basicColors.gold}
                  />
                </View>
              )}
              <View className="flex-1">
                <ThemedText className="text-base font-uber-move-medium">
                  Allow Anytime Access
                </ThemedText>
                <ThemedTextSecondary className="text-sm mt-0.5">
                  Guard can access gate controls 24/7, bypassing shift times
                </ThemedTextSecondary>
              </View>
            </View>
            <CustomToggle
              value={allowAnytimeAccess}
              onValueChange={handleToggleAnytimeAccess}
            />
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <View className="mt-10">
          <TouchableOpacity
            onPress={handleAssignDuty}
            disabled={!canSubmit || isSubmitting}
            activeOpacity={0.7}
            className="py-4 rounded-lg items-center justify-center"
            style={{
              backgroundColor: canSubmit
                ? themedColors.buttonBackground
                : themedColors.border,
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <ThemedText
              className="text-base font-uber-move-medium"
              style={{
                color: canSubmit
                  ? themedColors.buttonText
                  : themedColors.secondaryText,
              }}
            >
              Assign Duty
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {isSubmitting && (
        <LoadingOverlay currentTheme={currentTheme} withToast={false} />
      )}
    </ThemedView>
  );
};

export default AssignDutyScreen;
