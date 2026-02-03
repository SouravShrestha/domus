import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
  ScrollView,
  Text,
  Alert,
} from "react-native";
import TimePicker, { TimePickerRef } from "@/components/widgets/TimePicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import { router, useLocalSearchParams } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import {
  capitalizeFirstLetterOfWords,
  cleanFullName,
} from "@utils/textHelpers";
import { BoltSlashIcon, TrashXmarkIcon, PencilIcon } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { formatPhoneForApi, formatPhoneForDisplay } from "@/utils/phoneHelpers";
import {
  AvatarCook,
  AvatarDriver,
  AvatarNanny,
  AvatarMaid,
  AvatarStaff,
} from "@/assets/image-icons";
import {
  getStaffByResidence,
  updateStaff,
  updateAssignment,
  updateSchedules,
  removeStaffFromResidence,
  toggleAccessTemporarily,
} from "@api/services/staff.service";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  StaffCategory,
  StaffWithAssignment,
  STAFF_CATEGORIES,
  SHORT_DAY_NAMES,
  DAY_NAMES,
} from "@/types/models/staff";
import basicColors from "@/themes/colors";
import { Image } from "expo-image";
import CategoryPill from "@/components/widgets/CategoryPill";

type ScheduleDay = {
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
};

const formatTimeForDisplay = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatDateToTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}:00`;
};

const parseTimeToDate = (time: string): Date => {
  const date = new Date();
  const [hours, minutes] = time.split(":");
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return date;
};

const EditStaffScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const { currentResidence, isOwner, permissions } = useResidence();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    staffId: string;
    assignmentId: string;
  }>();

  const [staff, setStaff] = useState<StaffWithAssignment | null>(null);
  const [name, setName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<StaffCategory>("maid");
  const [vehicleNumber, setVehicleNumber] = useState<string>("");
  const [isAccessDisabled, setIsAccessDisabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const startTimePickerRef = useRef<TimePickerRef>(null);
  const endTimePickerRef = useRef<TimePickerRef>(null);
  const [sharedStartTime, setSharedStartTime] = useState<string>("09:00");
  const [sharedEndTime, setSharedEndTime] = useState<string>("18:00");
  const [schedules, setSchedules] = useState<ScheduleDay[]>(
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      isActive: false,
      startTime: "09:00",
      endTime: "18:00",
    }))
  );


  const canManageStaff = isOwner || permissions?.can_manage_staff || false;

  const fetchStaff = useCallback(async () => {
    if (!currentResidence?.id || !params.staffId) return;

    setIsLoading(true);
    try {
      const { data, error } = await getStaffByResidence(currentResidence.id);

      if (error) {
        console.error("Error fetching staff:", error);
        showErrorToast("Failed to load staff details");
        router.back();
        return;
      }

      console.log("Fetched staff data:", data);

      const foundStaff = data?.find((s) => s.id === params.staffId);
      if (!foundStaff) {
        showErrorToast("Staff not found");
        router.back();
        return;
      }

      setStaff(foundStaff);
      setName(foundStaff.name);
      setSelectedCategory(foundStaff.category);
      setVehicleNumber(foundStaff.vehicle_number || "");
      setIsAccessDisabled(foundStaff.is_access_disabled || false);

      const staffSchedules = foundStaff.schedules || [];
      const firstActiveSchedule = staffSchedules.find(s => s.is_active);
      const initialStartTime = firstActiveSchedule?.start_time?.slice(0, 5) || "09:00";
      const initialEndTime = firstActiveSchedule?.end_time?.slice(0, 5) || "18:00";
      
      setSharedStartTime(initialStartTime);
      setSharedEndTime(initialEndTime);
      
      setSchedules(
        Array.from({ length: 7 }, (_, i) => {
          const existing = staffSchedules.find((s) => s.day_of_week === i);
          return {
            dayOfWeek: i,
            isActive: existing?.is_active ?? false,
            startTime: initialStartTime,
            endTime: initialEndTime,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching staff:", error);
      showErrorToast("Failed to load staff details");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [currentResidence?.id, params.staffId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleNameChange = (text: string) => {
    const cleaned = cleanFullName(text);
    setName(cleaned);
  };

  const toggleDay = (dayIndex: number) => {
    if (!canManageStaff) return;
    setSchedules((prev) =>
      prev.map((s, i) => (i === dayIndex ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleStartTimeSelect = (time: Date) => {
    const timeStr = formatDateToTime(time).slice(0, 5);
    setSharedStartTime(timeStr);
    setSchedules(prev =>
      prev.map(s => ({ ...s, startTime: timeStr }))
    );
  };

  const handleEndTimeSelect = (time: Date) => {
    const timeStr = formatDateToTime(time).slice(0, 5);
    setSharedEndTime(timeStr);
    setSchedules(prev =>
      prev.map(s => ({ ...s, endTime: timeStr }))
    );
  };

  const handleSave = async () => {
    if (!staff || !canManageStaff) return;

    Keyboard.dismiss();

    const capitalizedName = capitalizeFirstLetterOfWords(name.trim());
    setName(capitalizedName);

    if (!capitalizedName) {
      showErrorToast("Please enter a valid name");
      return;
    }

    setIsSaving(true);
    try {
      const staffUpdates: any = {};
      if (capitalizedName !== staff.name) staffUpdates.name = capitalizedName;
      if (selectedCategory !== staff.category) staffUpdates.category = selectedCategory;
      if (vehicleNumber.trim() !== (staff.vehicle_number || "")) {
        staffUpdates.vehicle_number = vehicleNumber.trim() || null;
      }

      if (Object.keys(staffUpdates).length > 0) {
        const { error } = await updateStaff(staff.id, staffUpdates);
        if (error) throw error;
      }

      const activeSchedules = schedules
        .filter((s) => s.isActive)
        .map((s) => ({
          day_of_week: s.dayOfWeek,
          start_time: s.startTime,
          end_time: s.endTime,
          is_active: true,
        }));

      const { error: scheduleError } = await updateSchedules(
        staff.assignment.id,
        activeSchedules
      );
      if (scheduleError) throw scheduleError;

      showSuccessToast("Staff updated successfully");
      router.back();
    } catch (error: any) {
      console.error("Error updating staff:", error);
      showErrorToast("Failed to update staff. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveStaff = () => {
    if (!staff || !canManageStaff) return;

    Alert.alert(
      "Remove Staff",
      `Are you sure you want to remove ${staff.name} from your residence? They will no longer have access.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsSaving(true);
            try {
              const { error } = await removeStaffFromResidence(staff.assignment.id);
              if (error) throw error;

              showSuccessToast("Staff removed successfully");
              router.dismissTo(ROUTES.RESIDENT.SCREENS.STAFFS.INDEX);
            } catch (error) {
              console.error("Error removing staff:", error);
              showErrorToast("Failed to remove staff. Please try again.");
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleDisableAccess = async () => {
    if (!staff || !canManageStaff) return;

    setIsSaving(true);
    try {
      const { error } = await toggleAccessTemporarily(
        staff.id,
        true
      );
      if (error) throw error;

      setIsAccessDisabled(true);
      showSuccessToast("Access disabled");
    } catch (error) {
      console.error("Error disabling access:", error);
      showErrorToast("Failed to disable access");
    } finally {
      setIsSaving(false);
    }
  };



  const handleEnableAccess = async () => {
    if (!staff || !canManageStaff) return;

    setIsSaving(true);
    try {
      const { error } = await toggleAccessTemporarily(staff.id, false);
      if (error) throw error;

      setIsAccessDisabled(false);
      showSuccessToast("Access enabled");
    } catch (error) {
      console.error("Error enabling access:", error);
      showErrorToast("Failed to enable access");
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      maid: basicColors.lightPink,
      cook: basicColors.orange,
      driver: basicColors.blue,
      nanny: basicColors.lightPink,
      other: basicColors.gray,
    };
    return colors[category] || basicColors.gray;
  };

  const getCategoryAvatar = (category: StaffCategory) => {
    const avatars: Record<string, any> = {
      maid: AvatarMaid,
      cook: AvatarCook,
      driver: AvatarDriver,
      nanny: AvatarNanny,
    };
    return avatars[category] || AvatarStaff;
  };

  const isValid = name.trim().length > 0;

  if (isLoading) {
    return (
      <ThemedView className="flex-1">
        <StatusBar barStyle="default" animated />
        <LoadingOverlay currentTheme={currentTheme} withToast={false} />
      </ThemedView>
    );
  }

  if (!staff) {
    return (
      <ThemedView className="flex-1">
        <StatusBar barStyle="default" animated />
        <View className="flex-1 items-center justify-center">
          <ThemedText>Staff not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
        style={{
          marginTop: insets.top + 2,
        }}
      >
        <View className="pb-2 -mx-3 flex-row justify-between items-center">
          <View className="w-2/3">
            <ThemedHeaderWithBack onBackPress={() => router.back()} title="" />
          </View>
          {canManageStaff && (
            <View className="w-1/3 px-4">
              <TouchableOpacity
                onPress={handleSave}
                disabled={!isValid}
                className="items-end justify-center"
              >
                <Text
                  className="font-uber-move-medium text-base tracking-wide mt-1"
                  style={{
                    color: isValid
                      ? themedColors.accent
                      : themedColors.disabled,
                  }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="mt-4 mb-8 items-center">
          <TouchableOpacity onPress={() => {}} className="relative">
            <View className="w-24 h-24 overflow-hidden items-center justify-center">
              <Image
                source={
                staff.image_url
                  ? { uri: staff.image_url }
                  : getCategoryAvatar(staff.category)
              }
                style={{ width: 96, height: 96 }}
                resizeMode="cover"
                transition={200}
              />
            </View>
            <View
              className="absolute top-0 -right-5 w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: themedColors.buttonBackground,
              }}
            >
              <PencilIcon
                width={12}
                height={12}
                color={themedColors.buttonText}
              />
            </View>
          </TouchableOpacity>
          <ThemedTextSecondary className="text-xs mt-2">
            Tap to change image
          </ThemedTextSecondary>
        </View>

        {isAccessDisabled && (
          <View
            className="mb-4 p-4 rounded-lg flex-row items-center"
            style={{
              backgroundColor: themedColors.error + "15",
              borderWidth: 1,
              borderColor: themedColors.error + "30",
            }}
          >
            <BoltSlashIcon width={20} height={20} color={themedColors.error} />
            <View className="flex-1 ml-3">
              <ThemedText
                className="font-uber-move-medium"
                style={{ color: themedColors.error }}
              >
                Access Disabled
              </ThemedText>
              <ThemedTextSecondary className="font-lato-regular text-sm mt-0.5">
                This staff member cannot access the residence
              </ThemedTextSecondary>
            </View>
            {canManageStaff && (
              <TouchableOpacity
                onPress={handleEnableAccess}
                className="px-3 py-2 rounded-md"
                style={{ backgroundColor: themedColors.error + "20" }}
              >
                <ThemedText
                  className="font-uber-move-medium text-sm"
                  style={{ color: themedColors.error }}
                >
                  Enable
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View className="flex-col space-y-6">
          <View className="flex-row items-center">
            <View className="flex-1">
              <ThemedText className="font-uber-move-medium tracking-wider mb-2 ml-1">
                Full name
              </ThemedText>
              <TextInput
                className="rounded-md px-4 border font-uber-move-medium tracking-wider"
                style={{
                  height: 48,
                  fontSize: 16,
                  color: themedColors.text,
                  borderColor: themedColors.border,
                  backgroundColor: canManageStaff
                    ? "transparent"
                    : themedColors.disabled + "30",
                }}
                keyboardType="default"
                placeholder="Enter full name"
                placeholderTextColor={themedColors.placeholderText}
                value={name}
                onChangeText={handleNameChange}
                onFocus={() => setName(cleanFullName(name))}
                maxLength={30}
                editable={canManageStaff}
              />
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="flex-1 mt-1">
              <ThemedText className="font-uber-move-medium tracking-wider mb-2 ml-1">
                Phone Number
              </ThemedText>
              <View
                className="rounded-md px-4 border font-uber-move-medium tracking-wider justify-center"
                style={{
                  height: 48,
                  borderColor: themedColors.border,
                  backgroundColor: themedColors.disabled + "30",
                }}
              >
                <ThemedTextSecondary
                  className="font-uber-move-medium tracking-wider"
                  style={{ fontSize: 16 }}
                >
                  {formatPhoneForDisplay(staff.phone)}
                </ThemedTextSecondary>
              </View>
            </View>
          </View>

          <View className="flex-1">
            <ThemedText className="font-uber-move-medium mb-3 ml-1 tracking-wider mt-2">
              Staff Category
            </ThemedText>
            <View className="flex-row flex-wrap">
              <View className="flex-row flex-wrap">
                {STAFF_CATEGORIES.map((category) => (
                  <CategoryPill
                    key={category.value}
                    label={category.label}
                    value={category.value}
                    isSelected={selectedCategory === category.value}
                    onPress={() => setSelectedCategory(category.value)}
                    iconKey={category.value}
                  />
                ))}
              </View>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="flex-1">
              <ThemedText className="font-uber-move-medium tracking-wider mb-2 ml-1">
                Vehicle Number (Optional)
              </ThemedText>
              <TextInput
                className="rounded-md px-4 border font-uber-move-medium tracking-wider"
                style={{
                  height: 48,
                  fontSize: 16,
                  color: themedColors.text,
                  borderColor: themedColors.border,
                  backgroundColor: canManageStaff
                    ? "transparent"
                    : themedColors.disabled + "30",
                }}
                keyboardType="default"
                autoCapitalize="characters"
                placeholder="e.g., KA01AB1234"
                placeholderTextColor={themedColors.placeholderText}
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                maxLength={15}
                editable={canManageStaff}
              />
            </View>
          </View>

          <View>
            <ThemedText className="font-uber-move-medium mb-3 ml-1 tracking-wider mt-2">
              Allowed Days
            </ThemedText>
            <View className="flex-row justify-between">
              {schedules.map((schedule, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleDay(index)}
                  disabled={!canManageStaff}
                  className="items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    backgroundColor: schedule.isActive
                      ? themedColors.accent
                      : themedColors.cardBackground,
                    borderWidth: schedule.isActive ? 0 : 1,
                    borderColor: themedColors.border,
                    opacity: canManageStaff ? 1 : 0.6,
                  }}
                >
                  <Text
                    className="font-uber-move-bold text-sm"
                    style={{
                      color: schedule.isActive
                        ? themedColors.textOnAccent
                        : themedColors.text,
                    }}
                  >
                    {SHORT_DAY_NAMES[index].charAt(0)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <ThemedText className="font-uber-move-medium mb-3 ml-1 tracking-wider mt-2">
              Entry Timings
            </ThemedText>
            <View className="flex-row gap-x-3">
              <TouchableOpacity
                onPress={() =>
                  startTimePickerRef.current?.open(
                    parseTimeToDate(sharedStartTime)
                  )
                }
                disabled={!canManageStaff}
                className="flex-1 rounded-md p-4 border"
                style={{
                  borderColor: themedColors.lightBorder,
                  backgroundColor: canManageStaff
                    ? themedColors.cardBackground
                    : themedColors.disabled + "30",
                  opacity: canManageStaff ? 1 : 0.6,
                }}
              >
                <ThemedTextSecondary className="text-xs mb-1.5">
                  Start Time
                </ThemedTextSecondary>
                <ThemedText className="text-base font-uber-move-medium">
                  {formatTimeForDisplay(sharedStartTime)}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  endTimePickerRef.current?.open(
                    parseTimeToDate(sharedEndTime)
                  )
                }
                disabled={!canManageStaff}
                className="flex-1 rounded-md p-4 border"
                style={{
                  borderColor: themedColors.lightBorder,
                  backgroundColor: canManageStaff
                    ? themedColors.cardBackground
                    : themedColors.disabled + "30",
                  opacity: canManageStaff ? 1 : 0.6,
                }}
              >
                <ThemedTextSecondary className="text-xs mb-1.5">
                  End Time
                </ThemedTextSecondary>
                <ThemedText className="text-base font-uber-move-medium">
                  {formatTimeForDisplay(sharedEndTime)}
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedTextSecondary className="font-lato-regular text-sm mt-3 ml-1">
              These timings apply to all selected days
            </ThemedTextSecondary>
          </View>

            
          {canManageStaff && !isAccessDisabled && (
            <TouchableOpacity
              onPress={handleDisableAccess}
              className="flex-row items-center justify-center p-4 rounded-lg border"
              style={{
                borderColor: basicColors.gold,
                backgroundColor: basicColors.gold + "10",
              }}
            >
              <BoltSlashIcon width={18} height={18} color={basicColors.gold} />
              <ThemedText
                className="font-uber-move-medium ml-2"
                style={{ color: basicColors.gold }}
              >
                Disable Access
              </ThemedText>
            </TouchableOpacity>
          )}

          {canManageStaff && (
            <TouchableOpacity
              onPress={handleRemoveStaff}
              className="flex-row items-center justify-center p-4 rounded-lg border"
              style={{
                borderColor: themedColors.error,
                backgroundColor: themedColors.error + "10",
              }}
            >
              <TrashXmarkIcon
                width={18}
                height={18}
                color={themedColors.error}
              />
              <ThemedText
                className="font-uber-move-medium ml-2"
                style={{ color: themedColors.error }}
              >
                Remove Staff
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {isSaving && (
        <LoadingOverlay currentTheme={currentTheme} withToast={false} />
      )}

      <TimePicker
        ref={startTimePickerRef}
        onConfirm={handleStartTimeSelect}
        title="Select Start Time"
      />
      <TimePicker
        ref={endTimePickerRef}
        onConfirm={handleEndTimeSelect}
        title="Select End Time"
      />
    </ThemedView>
  );
};

export default EditStaffScreen;
