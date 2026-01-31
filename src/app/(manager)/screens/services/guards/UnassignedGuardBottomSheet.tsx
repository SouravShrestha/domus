import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GuardProfile } from "@/types/models/guard";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import {
  TrashXmarkIcon,
  CalendarIcon,
  CalendarClockIcon,
} from "@/components/icons";
import { ProfileIcon } from "@/components/widgets/ProfileIcon";
import basicColors from "@/themes/colors";

interface UnassignedGuardBottomSheetProps {
  guard:
    | (GuardProfile & {
        user: { id: string; name: string; phone: string; photo_url?: string };
      })
    | null;
  onRemoveGuard?: (guardProfileId: string) => void;
  onAssignDuty?: (guardProfileId: string) => void;
  isLoading?: boolean;
}

const UnassignedGuardBottomSheet: React.FC<UnassignedGuardBottomSheetProps> = ({
  guard,
  onRemoveGuard,
  onAssignDuty,
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

  const handleRemovePress = () => {
    if (isLoading || !onRemoveGuard) return;
    Alert.alert(
      "Remove Guard",
      `Are you sure you want to remove ${guard.user?.name || formatPhoneForDisplay(guard.user?.phone)} as a guard from this society?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => onRemoveGuard(guard.id),
          style: "destructive",
        },
      ],
    );
  };

  const handleAssignDutyPress = () => {
    if (isLoading || !onAssignDuty) return;
    onAssignDuty(guard.id);
  };

  return (
    <View className="flex-1" style={{ paddingBottom: insets.bottom + 12 }}>
      <View className="px-6 pt-4">
        <View className="flex-row items-center mb-4">
          <ProfileIcon
            username={guard.user?.name || "Guard"}
            avatarUrl={guard.user?.photo_url}
            size={52}
          />
          <View className="flex-1 ml-4">
            <ThemedText className="text-lg font-uber-move-medium tracking-wide">
              {guard.user?.name || "Unknown Guard"}
            </ThemedText>
            <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide mt-0.5">
              {guard.user?.phone ? formatPhoneForDisplay(guard.user.phone) : ""}
            </ThemedTextSecondary>
          </View>

          <View
            className="px-3 py-1.5 rounded-md"
            style={{ backgroundColor: basicColors.gray + "20" }}
          >
            <ThemedTextSecondary className="text-xs font-lato-medium">
              Unassigned
            </ThemedTextSecondary>
          </View>
        </View>

        <View
          className="mt-4 rounded-md overflow-hidden"
          style={{
            backgroundColor: themedColors.cardBackground,
            borderWidth: 1,
            borderColor:
              currentTheme === "dark"
                ? themedColors.border + "30"
                : themedColors.border,
          }}
        >
          <View className="flex-row items-center justify-between py-3 px-4">
            <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
              Joined On
            </ThemedTextSecondary>
            <ThemedText className="text-sm font-lato-regular">
              {formatDate(guard.created_at)}
            </ThemedText>
          </View>
        </View>

        <View className="flex-row-reverse mt-6 gap-x-3">
          <TouchableOpacity
            onPress={handleAssignDutyPress}
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
              Assign Duty
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRemovePress}
            disabled={isLoading || !onRemoveGuard}
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
              Remove Guard
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default UnassignedGuardBottomSheet;
