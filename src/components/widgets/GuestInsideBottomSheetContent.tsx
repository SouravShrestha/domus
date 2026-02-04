import React from "react";
import { View } from "react-native";
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
import { ProfileIcon } from "./ProfileIcon";

interface GuestInsideBottomSheetContentProps {
  guest: GuestLogWithInvitation | null;
}

const GuestInsideBottomSheetContent: React.FC<
  GuestInsideBottomSheetContentProps
> = ({ guest }) => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!guest) return null;

  const entryTime = new Date(guest.entry_time);

  const formatEntryTime = () => {
    const time = format(entryTime, "h:mm a");
    const date = format(entryTime, "d MMMM yyyy");
    return `${time}\n${date}`;
  };

  return (
    <View className="px-6 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
      <View className="flex-row items-center mb-4">
        <ProfileIcon username={guest.guest_invitation.visitor_name} size={52} />
        <View className="flex-1 ml-4">
          <ThemedText className="text-lg font-uber-move-medium tracking-wide">
            {guest.guest_invitation.visitor_name}
          </ThemedText>
          <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide mt-0.5">
            {formatPhoneForDisplay(guest.guest_invitation.visitor_phone)}
          </ThemedTextSecondary>
        </View>
      </View>

      <ThemedHR style={{ marginVertical: 16 }} />

      <View
        className="rounded-md overflow-hidden"
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
          <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
            Entry Time
          </ThemedTextSecondary>
          <ThemedText className="text-sm font-lato-regular text-right">
            {formatEntryTime()}
          </ThemedText>
        </View>

        {guest.entry_gate && (
          <View
            className="flex-row items-center justify-between py-3 px-4 border-b"
            style={{ borderColor: themedColors.lightBorder }}
          >
            <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
              Entry Gate
            </ThemedTextSecondary>
            <ThemedText className="text-sm font-lato-regular">
              {guest.entry_gate}
            </ThemedText>
          </View>
        )}

        {guest.guest_invitation.purpose && (
          <View className="flex-row items-center justify-between py-3 px-4">
            <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
              Purpose
            </ThemedTextSecondary>
            <ThemedText className="text-sm font-lato-regular">
              {guest.guest_invitation.purpose}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

export default GuestInsideBottomSheetContent;
