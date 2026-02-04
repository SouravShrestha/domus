import React from "react";
import { View } from "react-native";
import {
  ThemedHR,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UnifiedGuestHistoryEntry } from "@/types/models/visitor";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { format } from "date-fns";
import { ProfileIcon } from "./ProfileIcon";

interface GuestHistoryBottomSheetContentProps {
  entry: UnifiedGuestHistoryEntry | null;
}

const GuestHistoryBottomSheetContent: React.FC<
  GuestHistoryBottomSheetContentProps
> = ({ entry }) => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!entry) return null;

  const entryTime = new Date(entry.entry_time);
  const exitTime = entry.exit_time ? new Date(entry.exit_time) : null;

  const formatDateTime = (date: Date) => {
    const time = format(date, "h:mm a");
    const dateStr = format(date, "d MMMM yyyy");
    return `${time}\n${dateStr}`;
  };

  return (
    <View className="px-6 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
      <View className="flex-row items-center mb-4">
        <ProfileIcon username={entry.visitor_name} size={52} />
        <View className="flex-1 ml-4">
          <ThemedText className="text-lg font-uber-move-medium tracking-wide">
            {entry.visitor_name}
          </ThemedText>
          {entry.visitor_phone && (
            <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide mt-0.5">
              {formatPhoneForDisplay(entry.visitor_phone)}
            </ThemedTextSecondary>
          )}
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
            {formatDateTime(entryTime)}
          </ThemedText>
        </View>

        {exitTime && (
          <View
            className="flex-row items-center justify-between py-3 px-4 border-b"
            style={{ borderColor: themedColors.lightBorder }}
          >
            <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
              Exit Time
            </ThemedTextSecondary>
            <ThemedText className="text-sm font-lato-regular text-right">
              {formatDateTime(exitTime)}
            </ThemedText>
          </View>
        )}

        {entry.entry_gate && (
          <View
            className="flex-row items-center justify-between py-3 px-4 border-b"
            style={{ borderColor: themedColors.lightBorder }}
          >
            <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
              Entry Gate
            </ThemedTextSecondary>
            <ThemedText className="text-sm font-lato-regular">
              {entry.entry_gate}
            </ThemedText>
          </View>
        )}

        {entry.exit_gate && (
          <View
            className="flex-row items-center justify-between py-3 px-4 border-b"
            style={{ borderColor: themedColors.lightBorder }}
          >
            <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
              Exit Gate
            </ThemedTextSecondary>
            <ThemedText className="text-sm font-lato-regular">
              {entry.exit_gate}
            </ThemedText>
          </View>
        )}

        {entry.purpose && (
          <View className="flex-row items-center justify-between py-3 px-4">
            <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
              Purpose
            </ThemedTextSecondary>
            <ThemedText className="text-sm font-lato-regular">
              {entry.purpose}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

export default GuestHistoryBottomSheetContent;
