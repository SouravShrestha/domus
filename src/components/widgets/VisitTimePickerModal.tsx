import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
} from "react-native";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { ArrowIcon } from "@components/icons";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  format,
  startOfDay,
  isSameDay,
  setHours,
  setMinutes,
  isBefore,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

type TabType = "in" | "out";

interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  period: "Midnight" | "Morning" | "Afternoon" | "Evening";
}

interface VisitTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    inTime: Date,
    outTime: Date,
    isInTimeAny: boolean,
    isOutTimeAny: boolean,
  ) => void;
  initialInTime: Date;
  initialOutTime: Date;
  initialIsInTimeAny?: boolean;
  initialIsOutTimeAny?: boolean;
  hideOutTime?: boolean;
}

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 0; hour <= 23; hour++) {
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? "pm" : "am";
    let period: TimeSlot["period"];
    if (hour < 6) {
      period = "Midnight";
    } else if (hour < 12) {
      period = "Morning";
    } else if (hour < 18) {
      period = "Afternoon";
    } else {
      period = "Evening";
    }
    slots.push({
      hour,
      minute: 0,
      label: `${displayHour.toString().padStart(2, "0")}:00 ${ampm}`,
      period,
    });
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const VisitTimePickerModal: React.FC<VisitTimePickerModalProps> = ({
  visible,
  onConfirm,
  initialInTime,
  initialOutTime,
  initialIsInTimeAny = true,
  initialIsOutTimeAny = true,
  hideOutTime = false,
}) => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>("in");
  const [tempInTime, setTempInTime] = useState(initialInTime);
  const [tempOutTime, setTempOutTime] = useState(initialOutTime);
  const [selectedDate, setSelectedDate] = useState(startOfDay(initialInTime));
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialInTime));
  const [isInTimeAny, setIsInTimeAny] = useState(initialIsInTimeAny);
  const [isOutTimeAny, setIsOutTimeAny] = useState(initialIsOutTimeAny);

  const [tabAnimation] = useState(() => new Animated.Value(0));

  // Track previous visible state to detect when modal opens
  const [prevVisible, setPrevVisible] = useState(visible);

  if (visible && !prevVisible) {
    // Modal just opened - reset state
    setPrevVisible(visible);
    setActiveTab("in");
    setTempInTime(initialInTime);
    setTempOutTime(initialOutTime);
    setSelectedDate(startOfDay(initialInTime));
    setCurrentMonth(startOfMonth(initialInTime));
    setIsInTimeAny(initialIsInTimeAny);
    setIsOutTimeAny(initialIsOutTimeAny);
    tabAnimation.setValue(0);
  } else if (!visible && prevVisible) {
    setPrevVisible(visible);
  }

  useEffect(() => {
    Animated.spring(tabAnimation, {
      toValue: activeTab === "in" ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();
  }, [activeTab, tabAnimation]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    const newTime = setMinutes(setHours(selectedDate, slot.hour), slot.minute);
    if (activeTab === "in") {
      setIsInTimeAny(false);
      const newInTime = newTime;
      const newOutTime = isBefore(tempOutTime, newTime)
        ? setMinutes(setHours(selectedDate, slot.hour + 2), 0)
        : tempOutTime;
      setTempInTime(newInTime);
      setTempOutTime(newOutTime);
      if (hideOutTime) {
        onConfirm(newInTime, newOutTime, false, true);
        return;
      }
      setActiveTab("out");
      setSelectedDate(startOfDay(newOutTime));
      setCurrentMonth(startOfMonth(newOutTime));
    } else {
      if (isBefore(newTime, tempInTime)) {
        return;
      }
      setIsOutTimeAny(false);
      onConfirm(tempInTime, newTime, isInTimeAny, false);
    }
  };

  const handleNext = () => {
    if (activeTab === "in") {
      if (hideOutTime) {
        onConfirm(tempInTime, tempOutTime, isInTimeAny, true);
        return;
      }
      setActiveTab("out");
      setSelectedDate(startOfDay(tempOutTime));
      setCurrentMonth(startOfMonth(tempOutTime));
    } else {
      onConfirm(tempInTime, tempOutTime, isInTimeAny, isOutTimeAny);
    }
  };

  const handleCancel = () => {
    onConfirm(tempInTime, tempOutTime, isInTimeAny, isOutTimeAny);
  };

  const weekDays = useMemo(() => {
    const today = startOfDay(new Date());
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = isBefore(monthStart, today) ? today : monthStart;
    if (isBefore(monthEnd, start)) {
      return [];
    }
    return eachDayOfInterval({ start, end: monthEnd });
  }, [currentMonth]);

  const groupedTimeSlots = useMemo(() => {
    const groups: Record<string, TimeSlot[]> = {
      Morning: [],
      Afternoon: [],
      Evening: [],
      Midnight: [],
    };
    const now = new Date();
    const isToday = isSameDay(selectedDate, now);
    TIME_SLOTS.forEach((slot) => {
      if (isToday && slot.hour <= now.getHours()) {
        return;
      }
      if (activeTab === "out") {
        const slotTime = setMinutes(
          setHours(selectedDate, slot.hour),
          slot.minute,
        );
        if (isBefore(slotTime, tempInTime)) {
          return;
        }
      }
      groups[slot.period].push(slot);
    });
    return groups;
  }, [selectedDate, activeTab, tempInTime]);

  const canGoToPreviousMonth = useMemo(() => {
    const today = startOfDay(new Date());
    const prevMonth = subMonths(currentMonth, 1);
    const prevMonthEnd = endOfMonth(prevMonth);
    return !isBefore(prevMonthEnd, today);
  }, [currentMonth]);

  const isTimeSlotSelected = (slot: TimeSlot) => {
    const currentAnyTime = activeTab === "in" ? isInTimeAny : isOutTimeAny;
    if (currentAnyTime) return false;
    const currentTime = activeTab === "in" ? tempInTime : tempOutTime;
    return (
      isSameDay(selectedDate, currentTime) &&
      currentTime.getHours() === slot.hour &&
      currentTime.getMinutes() === slot.minute
    );
  };

  const handleAnyTimeSelect = () => {
    const dayStart = setMinutes(setHours(selectedDate, 0), 0);
    const dayEnd = setMinutes(setHours(selectedDate, 23), 59);
    if (activeTab === "in") {
      setIsInTimeAny(true);
      setTempInTime(dayStart);
      setTempOutTime(dayEnd);
      if (hideOutTime) {
        onConfirm(dayStart, dayEnd, true, true);
        return;
      }
      setActiveTab("out");
      setSelectedDate(startOfDay(dayEnd));
      setCurrentMonth(startOfMonth(dayEnd));
    } else {
      setIsOutTimeAny(true);
      onConfirm(tempInTime, dayEnd, isInTimeAny, true);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View
        className="flex-1"
        style={{ backgroundColor: themedColors.background }}
      >
        <View
          className="flex-row items-center justify-between px-5"
          style={{ marginTop: 24 }}
        >
          <TouchableOpacity onPress={handleCancel} className="mr-1">
            <ThemedText
              className="font-uber-move-medium text-base tracking-wider"
              style={{ color: themedColors.secondaryText }}
            >
              Cancel
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} className="mr-1">
            <ThemedText
              className="font-uber-move-bold text-base tracking-wider"
              style={{ color: themedColors.accent }}
            >
              {activeTab === "in"
                ? hideOutTime
                  ? "Finish"
                  : "Next"
                : "Finish"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-5" style={{ paddingTop: 24 }}>
          {!hideOutTime && (
            <View
              className="flex-row rounded-md p-1.5 mb-4"
              style={{
                backgroundColor: themedColors.cardBackground,
                position: "relative",
              }}
            >
              <Animated.View
                className="absolute rounded-md"
                style={{
                  top: 6,
                  bottom: 6,
                  left: tabAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["2.5%", "52.5%"],
                  }),
                  width: "45%",
                  backgroundColor: themedColors.buttonBackground,
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  setActiveTab("in");
                  setSelectedDate(startOfDay(tempInTime));
                  setCurrentMonth(startOfMonth(tempInTime));
                }}
                className="flex-1 py-2 rounded-md items-center"
              >
                <Animated.Text
                  className="font-uber-move-medium text-base"
                  style={{
                    color: tabAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        themedColors.buttonText,
                        themedColors.secondaryText,
                      ],
                    }),
                  }}
                >
                  In
                </Animated.Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setActiveTab("out");
                  setSelectedDate(startOfDay(tempOutTime));
                  setCurrentMonth(startOfMonth(tempOutTime));
                }}
                className="flex-1 py-2 rounded-md items-center"
              >
                <Animated.Text
                  className="font-uber-move-medium text-base"
                  style={{
                    color: tabAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        themedColors.secondaryText,
                        themedColors.buttonText,
                      ],
                    }),
                  }}
                >
                  Out
                </Animated.Text>
              </TouchableOpacity>
            </View>
          )}

          <View
            className="rounded-md p-4 mb-4"
            style={{ backgroundColor: themedColors.cardBackground }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() =>
                  canGoToPreviousMonth &&
                  setCurrentMonth(subMonths(currentMonth, 1))
                }
                className="p-2"
                style={{ opacity: canGoToPreviousMonth ? 1 : 0.3 }}
                disabled={!canGoToPreviousMonth}
              >
                <ArrowIcon width={16} height={16} stroke={themedColors.text} />
              </TouchableOpacity>
              <ThemedText className="font-uber-move-medium text-base">
                {format(currentMonth, "MMMM yyyy")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2"
                style={{ transform: [{ rotate: "180deg" }] }}
              >
                <ArrowIcon width={16} height={16} stroke={themedColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    onPress={() => handleDateSelect(day)}
                    className="items-center py-3 px-3 rounded-md"
                    style={{
                      backgroundColor: isSelected
                        ? themedColors.accent + "20"
                        : "transparent",
                      borderWidth: isSelected ? 1 : 0,
                      borderColor: themedColors.accent,
                      minWidth: 56,
                    }}
                  >
                    <ThemedTextSecondary
                      className="text-xs font-uber-move-medium mb-1"
                      style={{
                        color: isSelected
                          ? themedColors.accent
                          : themedColors.secondaryText,
                      }}
                    >
                      {format(day, "EEE")}
                    </ThemedTextSecondary>
                    <ThemedText
                      className="text-lg font-uber-move-bold"
                      style={{
                        color: isSelected
                          ? themedColors.accent
                          : themedColors.text,
                      }}
                    >
                      {format(day, "d")}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          >
            <TouchableOpacity
              onPress={handleAnyTimeSelect}
              className="py-3 px-4 rounded-md border mb-6"
              style={{
                backgroundColor: (
                  activeTab === "in" ? isInTimeAny : isOutTimeAny
                )
                  ? themedColors.accent + "15"
                  : themedColors.cardBackground,
                borderColor: (activeTab === "in" ? isInTimeAny : isOutTimeAny)
                  ? themedColors.accent
                  : themedColors.lightBorder,
              }}
            >
              <ThemedText
                className="text-base font-uber-move-medium text-center tracking-wider"
                style={{
                  color: (activeTab === "in" ? isInTimeAny : isOutTimeAny)
                    ? themedColors.accent
                    : themedColors.text,
                }}
              >
                Any time of the day
              </ThemedText>
            </TouchableOpacity>

            {Object.entries(groupedTimeSlots).map(([period, slots]) =>
              slots.length > 0 ? (
                <View key={period} className="mb-6">
                  <ThemedTextSecondary className="text-sm font-uber-move-medium mb-3 ml-1 uppercase tracking-wide">
                    {period}
                  </ThemedTextSecondary>
                  <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                    {slots.map((slot) => {
                      const isSelected = isTimeSlotSelected(slot);
                      return (
                        <TouchableOpacity
                          key={slot.label}
                          onPress={() => handleTimeSelect(slot)}
                          className="py-2 px-2.5 rounded-md border"
                          style={{
                            backgroundColor: isSelected
                              ? themedColors.accent + "15"
                              : themedColors.cardBackground,
                            borderColor: isSelected
                              ? themedColors.accent
                              : themedColors.lightBorder,
                          }}
                        >
                          <ThemedText
                            className="text-sm font-uber-move-medium"
                            style={{
                              color: isSelected
                                ? themedColors.accent
                                : themedColors.text,
                            }}
                          >
                            {slot.label}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : null,
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default VisitTimePickerModal;
