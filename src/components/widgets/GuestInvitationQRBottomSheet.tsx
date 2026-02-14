import React, { useMemo, useRef } from "react";
import { View, TouchableOpacity, Dimensions, Text, Alert } from "react-native";
import { Image } from "expo-image";
import {
  ThemedHR,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GuestInvitationWithDetails } from "@/types/models/visitor";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { format } from "date-fns";
import {
  CopyIcon,
  DownloadIcon,
  PaperPlaneIcon,
  TrashXmarkIcon,
} from "../icons";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import * as Clipboard from "expo-clipboard";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { shareQRCodeImage, saveImageToGallery } from "@/utils/qrHelpers";
import logoImage from "@assets/icons/splash-icon-light.png";

interface GuestInvitationQRBottomSheetContentProps {
  invitation: GuestInvitationWithDetails | null;
  onDelete?: (invitationId: string) => void;
  isLoading?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const QR_SIZE = Math.min(SCREEN_WIDTH * 0.32, 130);

const GuestInvitationQRBottomSheetContent: React.FC<
  GuestInvitationQRBottomSheetContentProps
> = ({ invitation, onDelete, isLoading = false }) => {
  const { themedColors, currentTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<ViewShot>(null);

  const qrValue = useMemo(() => {
    if (!invitation?.pass_code) return "";
    return `domus://guest/${invitation.pass_code}`;
  }, [invitation?.pass_code]);

  const handleCopyCode = async () => {
    if (invitation?.pass_code) {
      await Clipboard.setStringAsync(invitation.pass_code);
      showSuccessToast("Pass code copied", null, 2000);
    }
  };

  const buildGuestInviteMessage = (): string => {
    if (!invitation) return "";
    const validFrom = format(
      new Date(invitation.valid_from),
      "d MMMM yyyy, h:mm a",
    );
    const validUntil = format(
      new Date(invitation.valid_until),
      "d MMMM yyyy, h:mm a",
    );
    return `🎫 Guest Pass for ${invitation.visitor_name}\n\nPass Code: ${invitation.pass_code}\nValid: ${validFrom} - ${validUntil}\n\nShow this QR code or pass code at the gate for entry.\n\nPowered by Domus`;
  };

  const handleShare = async () => {
    try {
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        const message = buildGuestInviteMessage();
        await shareQRCodeImage(uri, message);
      }
    } catch {
      showErrorToast("Failed to share", null, 2000);
    }
  };

  const handleSave = async () => {
    try {
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        const success = await saveImageToGallery(uri);
        if (success) {
          showSuccessToast("Saved to gallery", null, 2000);
        } else {
          showErrorToast("Failed to save", null, 2000);
        }
      }
    } catch {
      showErrorToast("Failed to save", null, 2000);
    }
  };

  const handleDeletePress = () => {
    if (isLoading || !onDelete || !invitation) return;
    Alert.alert(
      "Delete Invitation",
      `Are you sure you want to delete the invitation for ${invitation.visitor_name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => onDelete(invitation.id),
          style: "destructive",
        },
      ],
    );
  };

  if (!invitation) return null;
  const validFrom = new Date(invitation.valid_from);
  const validUntil = new Date(invitation.valid_until);

  const formatTimingFrom = () => {
    const fromDate = format(validFrom, "d MMMM yyyy");
    const fromTime = format(validFrom, "h:mm a");
    return `${fromTime} \n${fromDate}`;
  };

  const formatTimingTo = () => {
    const toDate = format(validUntil, "d MMMM yyyy");
    const toTime = format(validUntil, "h:mm a");
    return `${toTime} \n${toDate}`;
  };

  // Build location string
  const getLocationString = () => {
    if (!invitation.residence) return "";
    const { short_name, society } = invitation.residence;
    const societyName = society?.name || "";
    if (societyName) {
      return `${short_name}, ${societyName},\n${society?.address?.street},\n${society?.address?.city}, ${society?.address?.zip_code}`;
    }
    return short_name;
  };

  return (
    <View className="px-2 pt-2" style={{ paddingBottom: insets.bottom + 16 }}>
      {/* Shareable Content - Wrapped in ViewShot */}
      <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
        <View
          className="overflow-hidden"
          style={{
            backgroundColor: themedColors.modal,
          }}
        >
          {/* Main Content */}
          <View className="px-5 pt-6 pb-5">
            {/* INVITED TO Section */}
            <View className="items-start">
              <ThemedText
                className="text-xs font-lato-regular uppercase tracking-widest mb-1"
                style={{ color: themedColors.secondaryText }}
              >
                {invitation.invited_by?.name}
              </ThemedText>
              <ThemedText
                className="text-base font-uber-move-medium"
                style={{ color: themedColors.text }}
              >
                {getLocationString()}
              </ThemedText>
            </View>

            <ThemedHR style={{ marginTop: 16, marginBottom: 14 }} />

            {/* Guest Name & Phone */}
            <View className="mb-6">
              <ThemedText
                className="text-xl font-uber-move-medium tracking-wider text-center"
                style={{ color: themedColors.text }}
              >
                {invitation.visitor_name}
              </ThemedText>
              <ThemedText
                className="text-sm font-uber-move-medium mt-1 tracking-wider text-center"
                style={{ color: themedColors.text }}
              >
                {formatPhoneForDisplay(invitation.visitor_phone)}
              </ThemedText>
            </View>

            {/* Timing Section */}
            <View className="flex-row justify-between">
              <View>
                <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest mb-1">
                  valid from:
                </ThemedTextSecondary>
                <ThemedText
                  className="text-base font-uber-move-medium tracking-wider"
                  style={{ color: themedColors.text }}
                >
                  {formatTimingFrom()}
                </ThemedText>
              </View>
              <View>
                <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest mb-1">
                  valid till:
                </ThemedTextSecondary>
                <ThemedText
                  className="text-base font-uber-move-medium tracking-wider"
                  style={{ color: themedColors.text }}
                >
                  {formatTimingTo()}
                </ThemedText>
              </View>
            </View>

            <ThemedHR style={{ marginTop: 18, marginBottom: 18 }} />

            {/* Share instruction */}
            <ThemedTextSecondary className="text-xs font-lato-regular mb-4 tracking-wide uppercase">
              Share this QR code at the gate
            </ThemedTextSecondary>

            {/* QR Code and OTP Section */}
            <View className="flex-row items-center">
              {/* QR Code */}
              <View
                className="rounded-xl p-3"
                style={{ backgroundColor: themedColors.modal }}
              >
                <QRCode
                  value={qrValue}
                  size={QR_SIZE}
                  logo={logoImage}
                  logoSize={35}
                  logoBackgroundColor={
                    currentTheme === "dark"
                      ? themedColors.qrBackground
                      : themedColors.text
                  }
                  logoMargin={0}
                  logoBorderRadius={0}
                  color={themedColors.text}
                  backgroundColor={"transparent"}
                />
              </View>

              {/* Divider */}
              <View
                className="w-px h-28 mx-4"
                style={{ backgroundColor: themedColors.border }}
              />

              {/* OTP Section */}
              <View className="flex-">
                <ThemedTextSecondary className="text-xs font-lato-regular mb-3 tracking-wide text-start">
                  Can't scan? {"\n"}Share invite code instead
                </ThemedTextSecondary>
                <TouchableOpacity
                  onPress={handleCopyCode}
                  activeOpacity={0.7}
                  className="rounded-md py-2 px-2 border flex-row items-center justify-center"
                  style={{
                    backgroundColor: themedColors.modal,
                    borderColor: themedColors.lightBorder,
                  }}
                >
                  <ThemedText
                    className="text-lg font-uber-move-medium tracking-widest text-center mr-2"
                    style={{ color: themedColors.text }}
                  >
                    {invitation.pass_code}
                  </ThemedText>
                  <CopyIcon width={14} height={14} color={themedColors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ThemedHR style={{ marginTop: 18, marginBottom: 20 }} />

            {/* Powered by Domus */}
            <View className="flex-row items-center justify-end">
              <View
                className="w-6 h-6 rounded mr-2 items-center justify-center"
                style={{ backgroundColor: themedColors.secondary }}
              >
                <Image
                  source={logoImage}
                  style={{ width: 20, height: 20 }}
                  contentFit="contain"
                />
              </View>
              <ThemedTextSecondary className="text-[13px] font-uber-move-medium tracking-wide">
                Powered by Domus
              </ThemedTextSecondary>
            </View>
          </View>
        </View>
      </ViewShot>

      {/* Action Buttons */}
      <View className="flex-row mt-4 mx-5 justify-between">
        {onDelete && (
          <TouchableOpacity
            onPress={handleDeletePress}
            activeOpacity={0.7}
            className="w-[30%] flex-row items-center justify-center py-4 rounded-full"
            style={{
              backgroundColor: themedColors.error,
            }}
          >
            <TrashXmarkIcon
              width={16}
              height={16}
              color={themedColors.buttonText}
            />
            <Text
              className="text-base font-uber-move-medium ml-2"
              style={{ color: themedColors.buttonText }}
            >
              Delete
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.7}
          className="flex-row items-center justify-center py-4 rounded-full"
          style={{
            width: onDelete ? "30%" : "48%",
            backgroundColor: themedColors.buttonBackground,
          }}
        >
          <DownloadIcon
            width={16}
            height={16}
            color={themedColors.buttonText}
          />
          <Text
            className="text-base font-uber-move-medium ml-2"
            style={{ color: themedColors.buttonText }}
          >
            Save
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.7}
          className="flex-row items-center justify-center py-4 rounded-full"
          style={{
            width: onDelete ? "30%" : "48%",
            backgroundColor: themedColors.buttonBackground,
          }}
        >
          <PaperPlaneIcon
            width={16}
            height={16}
            color={themedColors.buttonText}
          />
          <Text
            className="text-base font-uber-move-medium ml-2"
            style={{ color: themedColors.buttonText }}
          >
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GuestInvitationQRBottomSheetContent;
