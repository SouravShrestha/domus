import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GuardAssignment } from "@/types/models/guard";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import {
  TrashXmarkIcon,
  EditIcon,
  ClockIcon,
  CalendarClockIcon,
} from "@/components/icons";
import { ProfileIcon } from "@/components/widgets/ProfileIcon";
import basicColors from "@/themes/colors";

type GuardInfo = GuardAssignment & {
  guard: {
    id: string;
    name: string;
    phone: string;
    photo_url?: string;
  };
  status: "active" | "inactive";
};

interface AssignedGuardBottomSheetProps {
  guard: GuardInfo | null;
  onUnassign?: (assignmentId: string) => void;
  onEditAssignment?: (assignmentId: string, guard: GuardInfo) => void;
  isLoading?: boolean;
}

const formatTime = (time: string | null | undefined): string => {
  if (!time) return "-";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const AssignedGuardBottomSheet: React.FC<AssignedGuardBottomSheetProps> = ({
  guard,
  onUnassign,
  onEditAssignment,
  isLoading = false,
}) => {
  const { themedColors, currentTheme } = useTheme();
  const insets = useSafeAreaInsets();

  if (!guard) return null;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleUnassignPress = () => {
    if (isLoading || !onUnassign) return;
    Alert.alert(
      "Unassign guard from all gates",
      `Are you sure you want to unassign ${guard.guard?.name || formatPhoneForDisplay(guard.guard?.phone)} from all gates?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unassign",
          onPress: () => onUnassign(guard.id),
          style: "destructive",
        },
      ],
    );
  };

  const handleEditPress = () => {
    if (isLoading || !onEditAssignment) return;
    onEditAssignment(guard.id, guard);
  };

  const shiftTimings =
    guard.shift_start && guard.shift_end
      ? `${formatTime(guard.shift_start)} - ${formatTime(guard.shift_end)}`
      : "Flexible timing";

  return (
    <View className="flex-1" style={{ paddingBottom: insets.bottom + 12 }}>
      <View className="px-6 pt-4">
        <View className="flex-row items-center mb-4">
          <ProfileIcon
            username={guard.guard?.name || "Guard"}
            avatarUrl={guard.guard?.photo_url}
            size={52}
          />
          <View className="flex-1 ml-4">
            <ThemedText className="text-lg font-uber-move-medium tracking-wide">
              {guard.guard?.name || "Unknown Guard"}
            </ThemedText>
            <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide mt-0.5">
              {guard.guard?.phone
                ? formatPhoneForDisplay(guard.guard.phone)
                : ""}
            </ThemedTextSecondary>
          </View>

          <View
            className="px-3 py-1.5 rounded-md"
            style={{
              backgroundColor:
                guard.status === "active"
                  ? basicColors.brightGreen + "20"
                  : basicColors.gold + "20",
            }}
          >
            <ThemedText
              className="text-xs font-lato-medium"
              style={{
                color:
                  guard.status === "active"
                    ? basicColors.brightGreen
                    : basicColors.gold,
              }}
            >
              {guard.status === "active" ? "On Duty" : "Off Duty"}
            </ThemedText>
          </View>
        </View>

        <View
          className="mt-4 rounded-md overflow-hidden"
          style={{
            backgroundColor: themedColors.cardBackground,
            borderWidth: 1,
            borderColor: themedColors.lightBorder,
          }}
        >
          <View
            className="flex-row items-center justify-between py-3 px-4 border-b"
            style={{ borderColor: themedColors.lightBorder }}
          >
            <View className="flex-row items-center">
              <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
                Shift Timings
              </ThemedTextSecondary>
            </View>
            <ThemedText className="text-sm font-lato-regular">
              {shiftTimings}
            </ThemedText>
          </View>
          {guard.allow_anytime_access && (
            <View
              className="flex-row items-center justify-between py-3 px-4 border-b"
              style={{ borderColor: themedColors.lightBorder }}
            >
              <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
                Anytime Access
              </ThemedTextSecondary>
              <ThemedText
                className="text-sm font-lato-medium"
                style={{ color: basicColors.gold }}
              >
                Enabled
              </ThemedText>
            </View>
          )}
          <View className="flex-row items-center justify-between py-3 px-4">
            <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
              Assigned On
            </ThemedTextSecondary>
            <ThemedText className="text-sm font-lato-regular">
              {formatDate(guard.created_at)}
            </ThemedText>
          </View>
        </View>

        <View className="flex-row-reverse mt-6 gap-x-3">
          <TouchableOpacity
            onPress={handleEditPress}
            disabled={isLoading}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center justify-center py-3.5 rounded-md"
            style={{
              backgroundColor: themedColors.buttonBackground,
            }}
          >
            <CalendarClockIcon
              width={16}
              height={16}
              color={themedColors.buttonText}
            />
            <ThemedText
              className="text-sm font-uber-move-medium ml-2"
              style={{ color: themedColors.buttonText }}
            >
              Edit Assignment
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleUnassignPress}
            disabled={isLoading || !onUnassign}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center justify-center py-3.5 rounded-md"
            style={{
              backgroundColor: themedColors.error + "15",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <TrashXmarkIcon width={16} height={16} color={themedColors.error} />
            <ThemedText
              className="text-sm font-uber-move-medium ml-2"
              style={{ color: themedColors.error }}
            >
              Unassign from all
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AssignedGuardBottomSheet;
