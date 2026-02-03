import React, { useState, useRef } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import { useAuth } from "@contexts/authContext";
import { router, useLocalSearchParams } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import {
  capitalizeFirstLetterOfWords,
  cleanFullName,
} from "@utils/textHelpers";
import { BroomIcon, UserPlumberIcon } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { addStaff } from "@api/services/staff.service";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { StaffCategory, STAFF_CATEGORIES, SHORT_DAY_NAMES, StaffGender } from "@/types/models/staff";
import CategoryPill from "@/components/widgets/CategoryPill";
import TimePicker, { TimePickerRef } from "@/components/widgets/TimePicker";

type ScheduleDay = {
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
};

const DEFAULT_START_TIME = "07:00";
const DEFAULT_END_TIME = "22:00";

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

const StaffDetailsScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const { currentResidence } = useResidence();
  const { user, profile } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    phone: string;
    name?: string;
  }>();

  const [name, setName] = useState<string>(
    capitalizeFirstLetterOfWords(cleanFullName(params.name || ""))
  );
  const [selectedCategory, setSelectedCategory] = useState<StaffCategory>("maid");
  const [selectedGender, setSelectedGender] = useState<StaffGender>("male");
  const [vehicleNumber, setVehicleNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const startTimePickerRef = useRef<TimePickerRef>(null);
  const endTimePickerRef = useRef<TimePickerRef>(null);
  const [schedules, setSchedules] = useState<ScheduleDay[]>(
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      isActive: i >= 1 && i <= 6,
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
    }))
  );
  const [sharedStartTime, setSharedStartTime] = useState<string>(DEFAULT_START_TIME);
  const [sharedEndTime, setSharedEndTime] = useState<string>(DEFAULT_END_TIME);

  const isValid = name.trim().length > 0;

  const handleNameChange = (text: string) => {
    const cleaned = cleanFullName(text);
    setName(cleaned);
  };

  const toggleDay = (dayIndex: number) => {
    setSchedules(prev =>
      prev.map((s, i) =>
        i === dayIndex ? { ...s, isActive: !s.isActive } : s
      )
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

  const handleAddStaff = () => {
    Keyboard.dismiss();

    const capitalizedName = capitalizeFirstLetterOfWords(name.trim());
    setName(capitalizedName);

    if (!capitalizedName) {
      return;
    }

    const categoryLabel = STAFF_CATEGORIES.find((c) => c.value === selectedCategory)?.label;

    Alert.alert(
      "Confirm Staff",
      `Add ${capitalizedName} as ${categoryLabel}?`,
      [
        {
          text: "Cancel",
          style: "destructive",
        },
        {
          text: "Add Staff",
          onPress: async () => {
            if (!currentResidence?.id || !user?.id || !currentResidence?.society?.id) {
              showErrorToast("Unable to add staff. Please try again.");
              return;
            }

            setIsLoading(true);
            try {
              const activeSchedules = schedules
                .filter(s => s.isActive)
                .map(s => ({
                  day_of_week: s.dayOfWeek,
                  start_time: s.startTime,
                  end_time: s.endTime,
                  is_active: true,
                }));

              const { data, error } = await addStaff(
                currentResidence.id,
                user.id,
                {
                  name: capitalizedName,
                  phone: params.phone.replace(/[^0-9]/g, ""),
                  category: selectedCategory,
                  gender: selectedGender,
                  vehicle_number: vehicleNumber.trim() || undefined,
                },
                activeSchedules
              );

              if (error || !data) {
                throw error || new Error("Failed to add staff");
              }

              showSuccessToast("Staff added successfully");
              router.dismissTo(ROUTES.RESIDENT.SCREENS.STAFFS.INDEX);
            } catch (error: any) {
              console.error("Error adding staff:", error);
              const errorMessage = error?.message?.includes("already assigned")
                ? "This staff is already assigned to your residence."
                : "Failed to add staff. Please try again.";
              showErrorToast(errorMessage);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

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
              <ThemedHeaderWithBack
                onBackPress={() => {
                  router.back();
                }}
                title=""
              />
            </View>
            <View className="w-1/3 px-4">
              <TouchableOpacity onPress={handleAddStaff} disabled={!isValid} className="items-end justify-center">
                <Text
                  className="font-uber-move-medium text-base tracking-wide mt-1"
                  style={{
                    color: isValid
                      ? themedColors.accent
                      : themedColors.disabled,
                  }}
                >
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="mt-6 flex-col space-y-6">
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
                  }}
                  keyboardType="default"
                  autoFocus={!params.name}
                  placeholder="Enter full name"
                  placeholderTextColor={themedColors.placeholderText}
                  value={name}
                  onChangeText={handleNameChange}
                  onFocus={() => setName(cleanFullName(name))}
                  maxLength={30}
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
                    {params.phone}
                  </ThemedTextSecondary>
                </View>
              </View>
            </View>

            <View className="flex-1">
              <ThemedText className="font-uber-move-medium mb-3 ml-1 tracking-wider mt-2">
                Gender
              </ThemedText>
              <View className="flex-row flex-wrap">
                <CategoryPill
                  label="Male"
                  value="male"
                  iconKey="male"
                  isSelected={selectedGender === "male"}
                  onPress={() => setSelectedGender("male")}
                />
                <CategoryPill
                  label="Female"
                  value="female"
                  iconKey="female"
                  isSelected={selectedGender === "female"}
                  onPress={() => setSelectedGender("female")}
                />
              </View>
            </View>

            <View className="flex-1">
              <ThemedText className="font-uber-move-medium mb-3 ml-1 tracking-wider mt-0">
                Staff Category
              </ThemedText>
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
                  }}
                  keyboardType="default"
                  autoCapitalize="characters"
                  placeholder="e.g., KA01AB1234"
                  placeholderTextColor={themedColors.placeholderText}
                  value={vehicleNumber}
                  onChangeText={setVehicleNumber}
                  maxLength={15}
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
                    className="items-center justify-center w-10 h-10 rounded-full"
                    style={{
                      backgroundColor: schedule.isActive
                        ? themedColors.accent
                        : themedColors.cardBackground,
                      borderWidth: schedule.isActive ? 0 : 1,
                      borderColor: themedColors.border,
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
                  className="flex-1 rounded-md p-4 border"
                  style={{
                    borderColor: themedColors.lightBorder,
                    backgroundColor: themedColors.cardBackground,
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
                  className="flex-1 rounded-md p-4 border"
                  style={{
                    borderColor: themedColors.lightBorder,
                    backgroundColor: themedColors.cardBackground,
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
          </View>
        </ScrollView>

        {isLoading && (
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

export default StaffDetailsScreen;
