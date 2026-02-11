import React from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import {
  ThemedHR,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GuestLogWithInvitation } from "@/types/models/visitor";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { format } from "date-fns";
import { ExitIcon } from "../icons";

interface GuestInsideBottomSheetContentProps {
  guest: GuestLogWithInvitation | null;
  onMarkLeft?: (logId: string) => void;
  isLoading?: boolean;
}

const GuestInsideBottomSheetContent: React.FC<
  GuestInsideBottomSheetContentProps
> = ({ guest, onMarkLeft, isLoading = false }) => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!guest) return null;

  const entryTime = new Date(guest.entry_time);
  const validUntil = new Date(guest.guest_invitation.valid_until);

  const formatEntryTime = () => {
    const time = format(entryTime, "h:mm a");
    const date = format(entryTime, "d MMMM yyyy");
    return `${time} \n${date}`;
  };

  const formatValidUntil = () => {
    const time = format(validUntil, "h:mm a");
    const date = format(validUntil, "d MMMM yyyy");
    return `${time} \n${date}`;
  };

  const handleMarkLeft = () => {
    if (isLoading || !onMarkLeft) return;
    Alert.alert(
      "Mark as Left",
      `Has ${guest.guest_invitation.visitor_name} already left?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => onMarkLeft(guest.id),
        },
      ],
    );
  };

  return (
    <View className="px-2 pt-2" style={{ paddingBottom: insets.bottom + 16 }}>
      <View className="px-5 pt-6 pb-5">
        {/* Pass Code */}
        {guest.guest_invitation.pass_code && (
          <View className="items-start">
            <ThemedText
              className="text-xs font-lato-regular uppercase tracking-widest mb-1"
              style={{ color: themedColors.secondaryText }}
            >
              pass code
            </ThemedText>
            <ThemedText
              className="text-base font-uber-move-medium tracking-wider"
              style={{ color: themedColors.text }}
            >
              {guest.guest_invitation.pass_code}
            </ThemedText>
            <ThemedHR style={{ marginTop: 16, marginBottom: 14 }} />
          </View>
        )}

        {/* Guest Name & Phone */}
        <View className="mb-6">
          <ThemedText
            className="text-xl font-uber-move-medium tracking-wider text-center"
            style={{ color: themedColors.text }}
          >
            {guest.guest_invitation.visitor_name}
          </ThemedText>
          <ThemedText
            className="text-sm font-uber-move-medium mt-1 tracking-wider text-center"
            style={{ color: themedColors.text }}
          >
            {formatPhoneForDisplay(guest.guest_invitation.visitor_phone)}
          </ThemedText>
        </View>

        {/* Timing Section */}
        <View className="flex-row justify-between">
          <View>
            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest mb-1">
              entered at:
            </ThemedTextSecondary>
            <ThemedText
              className="text-base font-uber-move-medium tracking-wider"
              style={{ color: themedColors.text }}
            >
              {formatEntryTime()}
            </ThemedText>
          </View>
          <View>
            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest mb-1">
              pass valid till:
            </ThemedTextSecondary>
            <ThemedText
              className="text-base font-uber-move-medium tracking-wider"
              style={{ color: themedColors.text }}
            >
              {formatValidUntil()}
            </ThemedText>
          </View>
        </View>

        <ThemedHR style={{ marginTop: 18, marginBottom: 18 }} />

        {/* Details Section */}
        <View>
          {guest.entry_gate && (
            <View className="flex-row justify-between mb-3">
              <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
                entry gate
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-uber-move-medium tracking-wide">
                {guest.entry_gate}
              </ThemedText>
            </View>
          )}

          {guest.guest_invitation.purpose && (
            <View className="flex-row justify-between mb-3">
              <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
                purpose
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-uber-move-medium tracking-wide">
                {guest.guest_invitation.purpose}
              </ThemedText>
            </View>
          )}

          {guest.guest_invitation.vehicle_number && (
            <>
              <ThemedHR style={{ marginTop: 4, marginBottom: 20 }} />
              <View className="flex-row justify-between mb-3">
                <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
                  vehicle
                </ThemedTextSecondary>
                <ThemedText className="text-sm font-uber-move-medium tracking-wide">
                  {guest.guest_invitation.vehicle_number}
                </ThemedText>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Mark as Left Button */}
      {onMarkLeft && (
        <View className="mx-5 mt-2">
          <TouchableOpacity
            onPress={handleMarkLeft}
            activeOpacity={0.7}
            disabled={isLoading}
            className="flex-row items-center justify-center py-4 rounded-full"
            style={{
              backgroundColor: themedColors.error,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <ExitIcon width={16} height={16} color={themedColors.buttonText} />
            <Text
              className="text-base font-uber-move-medium ml-2"
              style={{ color: themedColors.buttonText }}
            >
              Guest has left?
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default GuestInsideBottomSheetContent;
