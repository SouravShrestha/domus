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
    return `${time} \n${dateStr}`;
  };

  return (
    <View className="px-2 pt-2" style={{ paddingBottom: insets.bottom + 16 }}>
      <View className="px-5 pt-6 pb-5">
        {/* Pass Code */}
        {entry.pass_code && (
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
              {entry.pass_code}
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
            {entry.visitor_name}
          </ThemedText>
          {entry.visitor_phone && (
            <ThemedText
              className="text-sm font-uber-move-medium mt-1 tracking-wider text-center"
              style={{ color: themedColors.text }}
            >
              {formatPhoneForDisplay(entry.visitor_phone)}
            </ThemedText>
          )}
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
              {formatDateTime(entryTime)}
            </ThemedText>
          </View>
          {exitTime && (
            <View>
              <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest mb-1">
                exited at:
              </ThemedTextSecondary>
              <ThemedText
                className="text-base font-uber-move-medium tracking-wider"
                style={{ color: themedColors.text }}
              >
                {formatDateTime(exitTime)}
              </ThemedText>
            </View>
          )}
        </View>

        <ThemedHR style={{ marginTop: 18, marginBottom: 18 }} />

        {/* Details Section */}
        <View>
          {entry.entry_gate && (
            <View className="flex-row justify-between mb-3">
              <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
                entry gate
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-uber-move-medium tracking-wide">
                {entry.entry_gate}
              </ThemedText>
            </View>
          )}

          {entry.exit_gate && (
            <View className="flex-row justify-between mb-3">
              <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
                exit gate
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-uber-move-medium tracking-wide">
                {entry.exit_gate}
              </ThemedText>
            </View>
          )}

          {entry.purpose && (
            <View className="flex-row justify-between mb-3">
              <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
                purpose
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-uber-move-medium tracking-wide">
                {entry.purpose}
              </ThemedText>
            </View>
          )}

          {entry.vehicle_number && (
            <>
              <ThemedHR style={{ marginTop: 4, marginBottom: 20 }} />
              <View className="flex-row justify-between mb-3">
                <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
                  vehicle
                </ThemedTextSecondary>
                <ThemedText className="text-sm font-uber-move-medium tracking-wide">
                  {entry.vehicle_number}
                </ThemedText>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default GuestHistoryBottomSheetContent;
