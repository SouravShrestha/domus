import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
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
import { router, useLocalSearchParams } from "expo-router";
import {
  getShiftById,
  createShift,
  updateShift,
} from "@api/services/shift.service";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { appEventEmitter, AppEvents } from "@/utils/eventEmitter";
import TimePicker, { TimePickerRef } from "@/components/widgets/TimePicker";
import CustomToggle from "@/components/widgets/CustomToggle";
import { SaveIcon } from "@/components/icons";

const parseTimeToDate = (time: string | null | undefined): Date => {
  const date = new Date();
  if (!time) {
    date.setHours(9, 0, 0, 0);
    return date;
  }
  const parts = time.split(":");
  date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
  return date;
};

const formatDateToTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}:00`;
};

const formatTimeForDisplay = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
};

const EditShiftScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    shiftId?: string;
    societyId?: string;
  }>();

  const isEditing = !!params.shiftId;
  const societyId = params.societyId || currentResidence?.society_id || "";

  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());

  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  const startTimePickerRef = useRef<TimePickerRef>(null);
  const endTimePickerRef = useRef<TimePickerRef>(null);

  useEffect(() => {
    if (isEditing && params.shiftId) {
      fetchShift(params.shiftId);
    } else {
      setStartTime(parseTimeToDate("06:00"));
      setEndTime(parseTimeToDate("14:00"));
    }
  }, [isEditing, params.shiftId]);

  const fetchShift = async (shiftId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await getShiftById(shiftId);
      if (error || !data) {
        console.error("Error fetching shift:", error);
        router.back();
        return;
      }
      setName(data.name);
      setStartTime(parseTimeToDate(data.start_time));
      setEndTime(parseTimeToDate(data.end_time));

      setIsActive(data.is_active);
    } catch (error) {
      console.error("Error fetching shift:", error);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const shiftData = {
        society_id: societyId,
        name: name.trim(),
        start_time: formatDateToTime(startTime),
        end_time: formatDateToTime(endTime),
        is_active: isActive,
      };

      if (isEditing && params.shiftId) {
        const { error } = await updateShift(params.shiftId, shiftData);
        if (error) {
          console.error("Error updating shift:", error);
          return;
        }
      } else {
        const { error } = await createShift(shiftData);
        if (error) {
          console.error("Error creating shift:", error);
          return;
        }
      }

      appEventEmitter.emit(AppEvents.SHIFT_UPDATED);
      router.back();
    } catch (error) {
      console.error("Error saving shift:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartTimeChange = (selectedDate: Date) => {
    setStartTime(selectedDate);
  };

  const handleEndTimeChange = (selectedDate: Date) => {
    setEndTime(selectedDate);
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
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="-mx-2">
          <ThemedHeaderWithBack
            title={isEditing ? "edit shift" : "new shift"}
            onBackPress={() => router.back()}
          />
        </View>

        <View className="mt-8">
          <ThemedText className="text-sm font-uber-move-medium mb-2">
            Shift Name
          </ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter shift name"
            placeholderTextColor={themedColors.placeholderText}
            className="rounded-lg px-4 py-3 border"
            style={{
              borderColor: themedColors.lightBorder,
              backgroundColor: themedColors.cardBackground,
              color: themedColors.text,
              fontSize: 16,
              lineHeight: 20,
            }}
          />
        </View>

        <View className="mt-6">
          <ThemedText className="text-sm font-uber-move-medium mb-3">
            Shift Timings
          </ThemedText>

          <View className="flex-row">
            <TouchableOpacity
              onPress={() => startTimePickerRef.current?.open(startTime)}
              className="flex-1 rounded-lg p-4 mr-2 border"
              style={{
                borderColor: themedColors.lightBorder,
                backgroundColor: themedColors.cardBackground,
              }}
            >
              <ThemedTextSecondary className="text-xs mb-1">
                Start Time
              </ThemedTextSecondary>
              <ThemedText className="text-base font-uber-move-medium">
                {formatTimeForDisplay(startTime)}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => endTimePickerRef.current?.open(endTime)}
              className="flex-1 rounded-lg p-4 ml-2 border"
              style={{
                borderColor: themedColors.lightBorder,
                backgroundColor: themedColors.cardBackground,
              }}
            >
              <ThemedTextSecondary className="text-xs mb-1">
                End Time
              </ThemedTextSecondary>
              <ThemedText className="text-base font-uber-move-medium">
                {formatTimeForDisplay(endTime)}
              </ThemedText>
            </TouchableOpacity>
          </View>

        </View>

        {isEditing && (
          <View
            className="flex-row items-center justify-between mt-6 rounded-lg p-4 border"
            style={{
              borderColor: themedColors.lightBorder,
              backgroundColor: themedColors.cardBackground,
            }}
          >
            <View className="w-2/3">
              <ThemedText className="text-base font-uber-move-medium">
                Active
              </ThemedText>
              <ThemedTextSecondary className="text-sm mt-1">
                Inactive shifts won't appear when creating assignments
              </ThemedTextSecondary>
            </View>
            <View className="w-1/5 items-center justify-center">
              <CustomToggle value={isActive} onValueChange={setIsActive} />
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSave}
          disabled={!name.trim() || isSaving}
          className="mt-8 rounded-md py-4 items-center flex-row justify-center"
          style={{
            backgroundColor: name.trim()
              ? themedColors.buttonBackground
              : themedColors.lightBorder,
          }}
        >
          <SaveIcon
            width={14}
            height={14}
            color={
              name.trim() ? themedColors.buttonText : themedColors.secondaryText
            }
          />
          <ThemedText
            className="text-base font-uber-move-medium ml-2"
            style={{
              color: name.trim()
                ? themedColors.buttonText
                : themedColors.secondaryText,
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {isSaving && <LoadingOverlay currentTheme={currentTheme} />}

      <TimePicker
        ref={startTimePickerRef}
        onConfirm={handleStartTimeChange}
        title="Start Time"
      />

      <TimePicker
        ref={endTimePickerRef}
        onConfirm={handleEndTimeChange}
        title="End Time"
      />
    </ThemedView>
  );
};

export default EditShiftScreen;
