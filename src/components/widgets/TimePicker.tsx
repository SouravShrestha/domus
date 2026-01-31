import React, {
  useMemo,
  useState,
  useEffect,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setHours, setMinutes } from "date-fns";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";

type PeriodType = "AM" | "PM";

interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  period: PeriodType;
}

export interface TimePickerRef {
  open: (time?: Date) => void;
  close: () => void;
}

interface TimePickerProps {
  onConfirm: (time: Date) => void;
  title?: string;
}

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period: PeriodType = hour >= 12 ? "PM" : "AM";
      slots.push({
        hour,
        minute,
        label: `${displayHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        period,
      });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const TimePicker = forwardRef<TimePickerRef, TimePickerProps>(
  ({ onConfirm, title = "Select Time" }, ref) => {
    const { themedColors } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);

    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("AM");
    const [selectedTime, setSelectedTime] = useState<Date | undefined>();

    useImperativeHandle(ref, () => ({
      open: (time?: Date) => {
        if (time) {
          setSelectedTime(time);
          setSelectedPeriod(time.getHours() >= 12 ? "PM" : "AM");
        }
        bottomSheetRef.current?.expand();
      },
      close: () => bottomSheetRef.current?.close(),
    }));

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

    const filteredTimeSlots = useMemo(() => {
      return TIME_SLOTS.filter((slot) => slot.period === selectedPeriod);
    }, [selectedPeriod]);

    const isTimeSlotSelected = (slot: TimeSlot) => {
      if (!selectedTime) return false;
      return (
        selectedTime.getHours() === slot.hour &&
        selectedTime.getMinutes() === slot.minute
      );
    };

    const handleTimeSelect = (slot: TimeSlot) => {
      const now = new Date();
      const newTime = setMinutes(setHours(now, slot.hour), slot.minute);
      onConfirm(newTime);
      bottomSheetRef.current?.close();
    };

    return (
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
          }}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView
            className="flex-1"
            style={{
              backgroundColor: themedColors.modal,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <View className="px-5 pt-2 pb-6">
              <ThemedText className="font-uber-move-bold text-lg text-center">
                {title}
              </ThemedText>
            </View>

            <View
              className="flex-row mx-5 mb-7 rounded-full overflow-hidden"
              style={{
                backgroundColor: themedColors.cardBackground,
                borderColor: themedColors.lightBorder,
                borderWidth: 1,
              }}
            >
              {(["AM", "PM"] as PeriodType[]).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setSelectedPeriod(period)}
                  className="flex-1 py-3 items-center justify-center"
                  style={{
                    backgroundColor:
                      selectedPeriod === period
                        ? themedColors.buttonBackground
                        : "transparent",
                  }}
                >
                  <ThemedText
                    className="font-uber-move-bold text-base"
                    style={{
                      color:
                        selectedPeriod === period
                          ? themedColors.buttonText
                          : themedColors.text,
                    }}
                  >
                    {period}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View
              className="flex-row flex-wrap items-center justify-center"
              style={{ gap: 10 }}
            >
              {filteredTimeSlots.map((slot) => {
                const isSelected = isTimeSlotSelected(slot);
                return (
                  <TouchableOpacity
                    key={slot.label + slot.period}
                    onPress={() => handleTimeSelect(slot)}
                    className="py-3 px-4 rounded-md border w-1/5 items-center justify-center"
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
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    );
  }
);

TimePicker.displayName = "TimePicker";

export default TimePicker;
