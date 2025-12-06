import React, { useCallback, useRef, useState } from "react";
import { View, TouchableOpacity, Platform, Keyboard } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { ThemedText } from "@themes/themedComponents";
import { ArrowIcon, CalendarIcon } from "@components/icons";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { format } from "date-fns";

interface DateTimePickerSheetProps {
  label: string;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onChange: (date: Date) => void;
  mode?: "date" | "time" | "datetime";
  portalHostName?: string;
}

const DateTimePickerSheet: React.FC<DateTimePickerSheetProps> = ({
  label,
  value,
  minimumDate,
  maximumDate,
  onChange,
  mode = "datetime",
  portalHostName,
}) => {
  const { themedColors, currentTheme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const [tempDate, setTempDate] = useState(value);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  const toggleBottomSheet = useCallback((expand: boolean) => {
    if (expand) {
      Keyboard.dismiss();
      setTempDate(value);
      setPickerMode("date");
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [value]);

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

  const handleDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleConfirm = () => {
    if (mode === "datetime" && pickerMode === "date") {
      setPickerMode("time");
      return;
    }
    onChange(tempDate);
    toggleBottomSheet(false);
  };

  const handleBack = () => {
    if (mode === "datetime" && pickerMode === "time") {
      setPickerMode("date");
      return;
    }
    toggleBottomSheet(false);
  };

  const formatDisplayValue = () => {
    if (mode === "date") {
      return format(value, "dd MMM, yyyy");
    } else if (mode === "time") {
      return format(value, "hh:mm a");
    }
    return format(value, "dd MMM, yyyy - hh:mm a");
  };

  const getSnapPoints = () => {
    if (Platform.OS === "ios") {
      return ["50%"];
    }
    return ["45%"];
  };

  return (
    <>
      <View>
        <ThemedText className="font-uber-move-medium tracking-wide mb-2 ml-1 text-sm">
          {label}
        </ThemedText>
        <TouchableOpacity
          onPress={() => toggleBottomSheet(true)}
          className="flex-row items-center justify-between px-4 rounded-lg border"
          style={{
            height: 48,
            backgroundColor: themedColors.inputBackground,
            borderColor: themedColors.border,
          }}
        >
          <View className="flex-row items-center">
            <CalendarIcon width={18} height={18} color={themedColors.secondaryText} />
            <ThemedText
              className="text-base font-uber-move-medium tracking-wider ml-3"
              style={{ color: themedColors.text }}
            >
              {formatDisplayValue()}
            </ThemedText>
          </View>
          <View style={{ transform: [{ rotate: "-90deg" }] }}>
            <ArrowIcon width={16} height={16} stroke={themedColors.text} />
          </View>
        </TouchableOpacity>
      </View>

      <Portal hostName={portalHostName}>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={getSnapPoints()}
          enablePanDownToClose
          backgroundStyle={{
            backgroundColor: themedColors.modal,
          }}
          handleIndicatorStyle={{
            backgroundColor: themedColors.accent,
          }}
          containerStyle={{
            paddingTop: 0,
            marginTop: 0,
            zIndex: 9999,
            elevation: 9999,
          }}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView
            className="flex-1"
            style={{ backgroundColor: themedColors.modal }}
          >
            <View className="px-4 pt-4">
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={handleBack}>
                  <ThemedText
                    className="text-base font-uber-move-medium"
                    style={{ color: themedColors.accent }}
                  >
                    {mode === "datetime" && pickerMode === "time" ? "Back" : "Cancel"}
                  </ThemedText>
                </TouchableOpacity>
                <ThemedText className="text-lg font-uber-move-medium tracking-wide">
                  {mode === "datetime"
                    ? pickerMode === "date"
                      ? "Select Date"
                      : "Select Time"
                    : mode === "date"
                    ? "Select Date"
                    : "Select Time"}
                </ThemedText>
                <TouchableOpacity onPress={handleConfirm}>
                  <ThemedText
                    className="text-base font-uber-move-medium"
                    style={{ color: themedColors.accent }}
                  >
                    {mode === "datetime" && pickerMode === "date" ? "Next" : "Done"}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <View className="items-center justify-center py-4">
                <DateTimePicker
                  value={tempDate}
                  mode={mode === "datetime" ? pickerMode : mode}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  themeVariant={currentTheme}
                  style={{ width: "100%" }}
                />
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </>
  );
};

export default DateTimePickerSheet;
