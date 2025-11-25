import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  CancelIcon,
  HeartIcon,
  BuildingIcon,
  MapPinIcon,
  UserHeartIcon,
  BadgeCheckIcon,
  ClockFiveIcon,
  TicketIcon,
  InfoIcon,
  ArrowIcon,
} from "@components/icons";
import {
  fetchResidenceWithSociety,
  searchInviteCode,
  requestResidenceMembership,
  acceptResidenceInvitation,
} from "@api/residence.service";
import { useAuth } from "@contexts/authContext";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import {
  InviteResponse,
  isResidenceInvite,
  isVisitorInvite,
} from "@/types/api/response/invite";
import { useTheme } from "@contexts/themeContext";
import {
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
} from "@themes/themedComponents";
import colorMapping from "@themes/colors";
import { capitalizeFirstLetterOfWords } from "@utils/textHelpers";
import LoadingOverlay from "@components/widgets/LoadingOverlay";
import { ROUTES } from "@/constants/routes";
import { showSuccessToast } from "@utils/toast";

export default function QRConfirmationScreen() {
  const params = useLocalSearchParams<{
    type: "public" | "invite";
    residenceId?: string;
    inviteCode?: string;
  }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { themedColors, currentTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [residenceData, setResidenceData] =
    useState<ResidenceWithSociety | null>(null);
  const [inviteData, setInviteData] = useState<InviteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (params.type === "public" && params.residenceId) {
        const { data, error } = await fetchResidenceWithSociety(
          params.residenceId
        );
        if (error) throw error;
        if (!data) throw new Error("Residence not found");
        setResidenceData(data);
      } else if (params.type === "invite" && params.inviteCode) {
        if (!profile?.phone) {
          throw new Error(
            "User phone number not found. Please update your profile."
          );
        }
        const { data, error } = await searchInviteCode(
          params.inviteCode.trim(),
          profile.phone
        );
        if (error) throw error;
        if (!data) throw new Error("Invite not found");
        setInviteData(data);
      } else {
        throw new Error("Invalid parameters");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load details";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params.type, params.residenceId, params.inviteCode, profile?.phone]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirm = () => {
    if (!profile) return;

    const performAction = async () => {
      setSubmitting(true);
      try {
        if (params.type === "public" && params.residenceId) {
          const { error } = await requestResidenceMembership(
            params.residenceId,
            profile.id
          );
          if (error) throw error;

          showSuccessToast("Request sent successfully!");
          router.replace(ROUTES.SCREENS.MEMBERSHIP_STATUS);
        } else if (params.type === "invite" && inviteData) {
          if (!profile.phone) throw new Error("User phone required");
          const { data, error } = await acceptResidenceInvitation(
            inviteData.id,
            profile.id,
            profile.phone
          );
          if (error) throw error;

          if (data && "status" in data && data.status !== "approved") {
            showSuccessToast("Invitation accepted! Awaiting approval...");
            router.replace({
              pathname: ROUTES.SCREENS.MEMBERSHIP_STATUS,
              params: {
                membershipId: data.id,
                initialStatus: data.status,
              },
            });
          } else {
            showSuccessToast("Invitation accepted successfully!");
            router.replace(ROUTES.SCREENS.INVITE_SUCCESS);
          }
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to process request";
        Alert.alert("Error", errorMessage);
      } finally {
        setSubmitting(false);
      }
    };

    if (params.type === "invite" && inviteData) {
      Alert.alert(
        "Confirmation",
        `Are you sure you want to join ${
          inviteData.residenceShortName
        } as a ${formatInviteTypeOnly(inviteData)}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Accept",
            onPress: performAction,
            style: "default",
          },
        ]
      );
    } else if (params.type === "public" && residenceData) {
      Alert.alert(
        "Request to Join",
        `Are you sure you want to request to join ${residenceData.society?.name}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Request",
            onPress: performAction,
            style: "default",
          },
        ]
      );
    }
  };

  const formatInviteTypeOnly = (invite: InviteResponse): string => {
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

  if (loading) {
    return <LoadingOverlay currentTheme={currentTheme} withToast={false} />;
  }

  if (error) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: themedColors.background }}
      >
        <View className="p-4">
          <TouchableOpacity onPress={() => router.back()}>
            <CancelIcon width={24} height={24} color={themedColors.text} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center p-5">
          <HeartIcon width={48} height={48} color="red" />
          <ThemedText className="mt-3 mb-5 text-red-500 text-center">
            {error}
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.back()}
            className="px-6 py-3 rounded-lg"
            style={{ backgroundColor: themedColors.buttonBackground }}
          >
            <ThemedText style={{ color: themedColors.buttonText }}>
              Go Back
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderInviteDetails = (invite: InviteResponse) => (
    <View className="px-5 pt-2">
      <View className="items-center mb-6">
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: themedColors.cardBackground }}
        >
          <BuildingIcon width={32} height={32} color={themedColors.text} />
        </View>
        <ThemedText className="text-2xl font-uber-move-bold text-center mb-1">
          {invite.residenceShortName}
        </ThemedText>
        <ThemedTextSecondary className="text-base text-center mb-4">
          {invite.societyName}
        </ThemedTextSecondary>
        <View
          className="px-4 py-2 rounded-full"
          style={{ backgroundColor: themedColors.primary + "15" }}
        >
          <ThemedText
            className="text-base font-uber-move-medium"
            style={{ color: themedColors.text }}
          >
            {isResidenceInvite(invite)
              ? "Resident Invitation"
              : "Visitor Invitation"}
          </ThemedText>
        </View>
      </View>

      <View
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{
          backgroundColor: themedColors.cardBackground,
          borderWidth: 1,
          borderColor:
            currentTheme === "dark"
              ? themedColors.border + "30"
              : themedColors.border,
        }}
      >
        {/* Invited By */}
        <View
          className="flex-row items-center p-4 border-b"
          style={{ borderColor: themedColors.border + "40" }}
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: themedColors.background }}
          >
            <UserHeartIcon width={20} height={20} color={themedColors.text} />
          </View>
          <View className="flex-1">
            <ThemedTextSecondary className="text-xs uppercase tracking-wider mb-0.5">
              Invited By
            </ThemedTextSecondary>
            <ThemedText className="text-base font-uber-move-medium tracking-wider">
              {invite.invitedByUserName}
            </ThemedText>
          </View>
        </View>

        {/* Role / Type */}
        <View
          className="flex-row items-center p-4 border-b"
          style={{ borderColor: themedColors.border + "40" }}
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: themedColors.background }}
          >
            <BadgeCheckIcon width={20} height={20} color={themedColors.text} />
          </View>
          <View className="flex-1">
            <ThemedTextSecondary className="text-xs uppercase tracking-wider mb-0.5">
              Role
            </ThemedTextSecondary>
            <ThemedText className="text-base font-uber-move-medium tracking-wider">
              {isResidenceInvite(invite) && invite.residentRole
                ? capitalizeFirstLetterOfWords(invite.residentRole)
                : formatInviteTypeOnly(invite)}
            </ThemedText>
          </View>
        </View>

        {/* Visitor Specifics */}
        {isVisitorInvite(invite) && (
          <>
            <View
              className="flex-row items-center p-4 border-b"
              style={{ borderColor: themedColors.border + "40" }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: themedColors.background }}
              >
                <ClockFiveIcon
                  width={20}
                  height={20}
                  color={themedColors.text}
                />
              </View>
              <View className="flex-1">
                <ThemedTextSecondary className="text-xs uppercase tracking-wider mb-0.5">
                  Check In
                </ThemedTextSecondary>
                <ThemedText className="text-base font-medium">
                  {formatDateTime(invite.expectedCheckInTime!)}
                </ThemedText>
              </View>
            </View>
            <View
              className="flex-row items-center p-4 border-b"
              style={{ borderColor: themedColors.border + "40" }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: themedColors.background }}
              >
                <ClockFiveIcon
                  width={20}
                  height={20}
                  color={themedColors.text}
                />
              </View>
              <View className="flex-1">
                <ThemedTextSecondary className="text-xs uppercase tracking-wider mb-0.5">
                  Check Out
                </ThemedTextSecondary>
                <ThemedText className="text-base font-medium">
                  {formatDateTime(invite.expectedCheckOutTime!)}
                </ThemedText>
              </View>
            </View>
            {invite.visitPurpose && (
              <View
                className="flex-row items-center p-4 border-b"
                style={{ borderColor: themedColors.border + "40" }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: themedColors.background }}
                >
                  <InfoIcon width={20} height={20} color={themedColors.text} />
                </View>
                <View className="flex-1">
                  <ThemedTextSecondary className="text-xs uppercase tracking-wider mb-0.5">
                    Purpose
                  </ThemedTextSecondary>
                  <ThemedText className="text-base font-uber-move-medium tracking-wide">
                    {invite.visitPurpose}
                  </ThemedText>
                </View>
              </View>
            )}
          </>
        )}

        {/* Code */}
        <View className="flex-row items-center p-4">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: themedColors.background }}
          >
            <TicketIcon width={20} height={20} color={themedColors.text} />
          </View>
          <View className="flex-1">
            <ThemedTextSecondary className="text-xs uppercase tracking-wider mb-0.5">
              Invite Code
            </ThemedTextSecondary>
            <ThemedText
              className="text-base font-uber-move-medium tracking-widest"
              style={{ color: themedColors.accent }}
            >
              {invite.code}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Expiry Message for Residents */}
      {isResidenceInvite(invite) && invite.expiresAt && (
        <View className="flex-row items-center justify-center mt-4 opacity-70">
          <ClockFiveIcon
            width={14}
            height={14}
            color={themedColors.secondaryText}
          />
          <ThemedTextSecondary className="text-xs ml-1.5">
            Expires on {formatExpiryDate(invite.expiresAt)}
          </ThemedTextSecondary>
        </View>
      )}

      {invite.used && (
        <View
          className="mt-6 px-4 py-3 rounded-xl flex-row items-center justify-center space-x-2"
          style={{ backgroundColor: colorMapping.red + "15" }}
        >
          <InfoIcon width={20} height={20} color={colorMapping.red} />
          <ThemedText
            className="text-sm font-medium"
            style={{ color: colorMapping.red }}
          >
            This invitation has already been used
          </ThemedText>
        </View>
      )}
    </View>
  );

  const renderPublicDetails = (residence: ResidenceWithSociety) => (
    <View className="px-5 pt-2">
      <View className="items-center mb-6">
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: themedColors.cardBackground }}
        >
          <BuildingIcon width={32} height={32} color={themedColors.primary} />
        </View>
        <ThemedText className="text-2xl font-uber-move-bold text-center mb-1">
          {residence.block ? `${residence.block} - ` : ""}
          {residence.flat_number}
        </ThemedText>
        <ThemedTextSecondary className="text-base text-center mb-4">
          {residence.society?.name}
        </ThemedTextSecondary>
        <View
          className="px-4 py-2 rounded-full"
          style={{ backgroundColor: themedColors.primary + "15" }}
        >
          <ThemedText
            className="text-sm font-uber-move-medium"
            style={{ color: themedColors.primary }}
          >
            Join Request
          </ThemedText>
        </View>
      </View>

      <View className="mb-6">
        <ThemedTextSecondary className="text-center text-sm leading-5 px-4">
          You are requesting to join this residence. The admin will need to
          approve your request before you can access society features.
        </ThemedTextSecondary>
      </View>

      <View
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{
          backgroundColor: themedColors.cardBackground,
          borderWidth: 1,
          borderColor:
            currentTheme === "dark"
              ? themedColors.border + "30"
              : themedColors.border,
        }}
      >
        <View
          className="flex-row items-center p-4 border-b"
          style={{ borderColor: themedColors.border + "40" }}
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: themedColors.background }}
          >
            <MapPinIcon width={20} height={20} color={themedColors.text} />
          </View>
          <View className="flex-1">
            <ThemedTextSecondary className="text-xs uppercase tracking-wider mb-0.5">
              Location
            </ThemedTextSecondary>
            <ThemedText className="text-base font-medium">
              {residence.society?.address?.street},{" "}
              {residence.society?.address?.city}
            </ThemedText>
          </View>
        </View>

        <View className="flex-row items-center p-4">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: themedColors.background }}
          >
            <BuildingIcon width={20} height={20} color={themedColors.text} />
          </View>
          <View className="flex-1">
            <ThemedTextSecondary className="text-xs uppercase tracking-wider mb-0.5">
              Residence Type
            </ThemedTextSecondary>
            <ThemedText className="text-base font-medium">
              Private Residence
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 px-2"
      style={{ backgroundColor: themedColors.background }}
    >
      {submitting && (
        <LoadingOverlay currentTheme={currentTheme} withToast={false} />
      )}
      <View className="p-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowIcon width={24} height={24} stroke={themedColors.text} />
        </TouchableOpacity>
      </View>
      <ThemedView className="flex-1">
        {params.type === "invite" &&
          inviteData &&
          renderInviteDetails(inviteData)}
        {params.type === "public" &&
          residenceData &&
          renderPublicDetails(residenceData)}
      </ThemedView>

      {/* Action Buttons */}
      {((inviteData && !inviteData.used) || residenceData) && (
        <View className="px-6 pt-4">
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={submitting}
            className="p-4 rounded-xl items-center shadow-md mb-3"
            style={{
              backgroundColor: themedColors.buttonBackground,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <View className="flex-row items-center justify-center">
              <ThemedText
                className="text-base font-uber-move-medium tracking-wider"
                style={{ color: themedColors.buttonText }}
              >
                {params.type === "public"
                  ? "Send Request to Join"
                  : isResidenceInvite(inviteData!)
                  ? "Join Residence"
                  : "Accept Invitation"}
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={submitting}
            className="p-3 rounded-xl items-center"
            style={{
              opacity: submitting ? 0.6 : 1,
            }}
          >
            <ThemedText
              className="text-base font-uber-move-medium tracking-wider"
              style={{ color: themedColors.secondaryText }}
            >
              Not now
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
