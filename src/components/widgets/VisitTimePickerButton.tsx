import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { ArrowIcon, ClockFiveIcon } from "@components/icons";
import { useTheme } from "@/contexts/themeContext";
import { format } from "date-fns";

interface VisitTimePickerButtonProps {
  inTime: Date;
  outTime: Date;
  isInTimeAny?: boolean;
  isOutTimeAny?: boolean;
  hideOutTime?: boolean;
  onPress: () => void;
}

const VisitTimePickerButton: React.FC<VisitTimePickerButtonProps> = ({
  inTime,
  outTime,
  isInTimeAny = false,
  isOutTimeAny = false,
  hideOutTime = false,
  onPress,
}) => {
  const { themedColors } = useTheme();

  const formatDate = (date: Date) => {
    return format(date, "dd MMM yyyy");
  };

  const formatInTime = () => {
    if (isInTimeAny) return "Anytime";
    return format(inTime, "hh:mm a");
  };

  const formatOutTime = () => {
    if (isOutTimeAny) return "Anytime";
    return format(outTime, "hh:mm a");
  };

  return (
    <View>
      <ThemedText className="font-uber-move-medium tracking-wide mb-4 ml-1 text-sm">
        Visit Time
      </ThemedText>
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between px-4 rounded-lg border py-3"
        style={{
          backgroundColor: themedColors.inputBackground,
          borderColor: themedColors.lightBorder,
        }}
      >
        <View className="flex-row items-center flex-1">
          <View className="flex-row items-center flex-1">
            <View
              className={`flex-1 items-center${hideOutTime ? "" : " border-r"}`}
              style={
                hideOutTime
                  ? undefined
                  : { borderColor: themedColors.lightBorder }
              }
            >
              <ThemedTextSecondary className="text-xs font-uber-move-medium">
                IN TIME
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-uber-move-medium tracking-wider mt-1">
                {formatDate(inTime)}
              </ThemedText>
              <ThemedText className="text-sm font-uber-move-medium tracking-wider">
                {formatInTime()}
              </ThemedText>
            </View>
            {!hideOutTime && (
              <View className="flex-1 items-center">
                <ThemedTextSecondary className="text-xs font-uber-move-medium">
                  OUT TIME
                </ThemedTextSecondary>
                <ThemedText className="text-sm font-uber-move-medium tracking-wider mt-1">
                  {formatDate(outTime)}
                </ThemedText>
                <ThemedText className="text-sm font-uber-move-medium tracking-wider">
                  {formatOutTime()}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default VisitTimePickerButton;
