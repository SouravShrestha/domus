import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import {
  InviteResponse,
  isResidenceInvite,
  isVisitorInvite,
} from "@/types/api/response/invite";
import colorMapping from "@themes/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";

interface ResidenceInviteDetailsBottomSheetProps {
  invite: InviteResponse | null;
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

export interface ResidenceInviteDetailsBottomSheetRef {
  open: () => void;
  close: () => void;
}

const ResidenceInviteDetailsBottomSheet = forwardRef<
  ResidenceInviteDetailsBottomSheetRef,
  ResidenceInviteDetailsBottomSheetProps
>(({ invite, onAccept, onReject, isLoading = false }, ref) => {
  const { themedColors, currentTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.expand(),
    close: () => bottomSheetRef.current?.close(),
  }));

  if (!invite) return null;

  const formatInviteTypeOnly = (): string => {
    if (isResidenceInvite(invite)) {
      return "Resident";
    } else if (isVisitorInvite(invite)) {
      return "Visitor";
    }
    return "Invite";
  };

  const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatExpiryDate = (expiresAt: string): string => {
    const date = new Date(expiresAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAcceptPress = () => {
    if (isLoading) return;
    Alert.alert(
      "Accept Invitation",
      `Are you sure you want to accept the invitation to join ${invite.residenceShortName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Accept",
          onPress: onAccept,
          style: "default",
        },
      ]
    );
  };

  const handleRejectPress = () => {
    if (isLoading) return;
    Alert.alert(
      "Reject Invitation",
      `Are you sure you want to reject the invitation to join ${invite.residenceShortName}? \n\nThis action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Decline",
          onPress: onReject,
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: themedColors.modal }}>
      {/* Header with Unit Name and Type */}
      <View className="px-6 pt-6">
        <ThemedText className="text-2xl font-uber-move-medium tracking-wide mb-1">
          {invite.residenceShortName}
        </ThemedText>
        <ThemedText className="text-xl font-uber-move-medium tracking-wide mb-3">
          {invite.societyName}
        </ThemedText>
        <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide leading5">
          {isResidenceInvite(invite)
            ? `You have been invited to join ${invite.residenceShortName
            } as a ${formatInviteTypeOnly()}. \nPlease verify the invitation to continue.`
            : `You have been invited to visit ${invite.residenceShortName
            } as a ${formatInviteTypeOnly()}. \nPlease verify the invitation to continue.`}
        </ThemedTextSecondary>
      </View>

      {/* Table Design for Details */}
      <View className="px-6 pt-6">
        <View
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: themedColors.cardBackground,
            borderWidth: 1,
            borderColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
          }}
        >
          {/* Table Row */}
          <View
            className="flex-row items-center justify-between py-3 px-4"
            style={{
              borderBottomWidth: 1,
              borderColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
            }}
          >
            <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
              Invited By
            </ThemedTextSecondary>
            <ThemedText className="text-base font-lato-regular flex-1 text-right">
              {invite.invitedByUserName}
            </ThemedText>
          </View>

          {/* Table Row */}
          <View
            className="flex-row items-center justify-between py-3 px-4"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
            }}
          >
            <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
              Type
            </ThemedTextSecondary>
            <ThemedText className="text-base font-lato-regular flex-1 text-right">
              {formatInviteTypeOnly()}
            </ThemedText>
          </View>

          {/* Resident Role (only for residence invites) */}
          {isResidenceInvite(invite) && invite.residentRole && (
            <View
              className="flex-row items-center justify-between py-3 px-4"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
              }}
            >
              <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                Role
              </ThemedTextSecondary>
              <ThemedText className="text-base font-lato-regular flex-1 text-right">
                {capitalizeFirstLetterOfWords(invite.residentRole)}
              </ThemedText>
            </View>
          )}

          {/* Visitor-specific fields */}
          {isVisitorInvite(invite) && (
            <>
              <View
                className="flex-row items-center justify-between py-3 px-4"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                }}
              >
                <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                  Expected Check-In
                </ThemedTextSecondary>
                <ThemedText className="text-base font-lato-regular flex-1 text-right">
                  {formatDateTime(invite.expectedCheckInTime)}
                </ThemedText>
              </View>
              <View
                className="flex-row items-center justify-between py-3 px-4"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                }}
              >
                <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                  Expected Check-Out
                </ThemedTextSecondary>
                <ThemedText className="text-base font-lato-regular flex-1 text-right">
                  {formatDateTime(invite.expectedCheckOutTime)}
                </ThemedText>
              </View>
              {invite.visitPurpose && (
                <View
                  className="flex-row items-center justify-between py-3 px-4"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                  }}
                >
                  <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                    Visit Purpose
                  </ThemedTextSecondary>
                  <ThemedText className="text-base font-lato-regular flex-1 text-right">
                    {invite.visitPurpose}
                  </ThemedText>
                </View>
              )}
            </>
          )}

          {/* Table Row */}
          <View
            className="flex-row items-center justify-between py-3 px-4"
            style={{
              borderBottomWidth: isResidenceInvite(invite) ? 1 : 0,
              borderBottomColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
            }}
          >
            <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
              Invite Code
            </ThemedTextSecondary>
            <ThemedText
              className="text-base font-lato-medium flex-1 text-right"
              style={{ color: themedColors.accent }}
            >
              {invite.code}
            </ThemedText>
          </View>

          {/* Expires On - Only show for residence invites */}
          {isResidenceInvite(invite) && (
            <View className="flex-row items-center justify-between py-3 px-4">
              <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                Expires On
              </ThemedTextSecondary>
              <ThemedText className="text-base font-lato-regular flex-1 text-right">
                {formatExpiryDate(invite.expiresAt)}
              </ThemedText>
            </View>
          )}
        </View>

        {invite.used && (
          <View
            className="mt-4 px-4 py-3 rounded-lg items-center"
            style={{
              backgroundColor: colorMapping.green + "20",
              borderWidth: 1,
              borderColor: colorMapping.green + "50",
              marginBottom: insets.bottom + 24
            }}
          >
            <ThemedText
              className="text-sm font-lato-medium"
              style={{ color: colorMapping.green }}
            >
              This invitation has already been used
            </ThemedText>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {!invite.used && (
        <View
          className="px-6 pt-6 pb-6"
          style={{ gap: 12, paddingBottom: insets.bottom + 24 }}
        >
          <TouchableOpacity
            onPress={handleAcceptPress}
            disabled={isLoading}
            className="p-4 rounded-lg items-center"
            style={{
              backgroundColor: themedColors.buttonBackground,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <Text
              className="text-base font-uber-move-medium tracking-wider"
              style={{ color: themedColors.buttonText }}
            >
              {isResidenceInvite(invite)
                ? "Join residence"
                : "Accept invitation"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRejectPress}
            disabled={isLoading}
            className="p-2 rounded-lg items-center"
            style={{
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <ThemedText
              className="text-sm font-uber-move-medium tracking-wider border-b px-1 pb-0.5"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: themedColors.text,
              }}
            >
              Decline
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

ResidenceInviteDetailsBottomSheet.displayName =
  "ResidenceInviteDetailsBottomSheet";

export default ResidenceInviteDetailsBottomSheet;
