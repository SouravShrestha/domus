import React, { useState, useMemo } from "react";
import { View, TouchableOpacity, Alert, Modal, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PendingInviteWithDetails } from "@/api/interfaces/residence.interface";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { ClockFiveIcon, CopyIcon, ShareIcon, SmsIcon, QRIcon, HourglassEndIcon, EnvelopeIcon, PaperPlaneIcon, TrashXmarkIcon } from "../icons";
import { ProfileIcon } from "./ProfileIcon";
import * as Clipboard from "expo-clipboard";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { buildInviteMessage, shareViaSms, shareUniversal } from "@/utils/qrHelpers";
import QRCode from "react-native-qrcode-svg";
import logoImage from "@assets/icons/splash-icon-light.png";

interface PendingMemberBottomSheetProps {
  invite: PendingInviteWithDetails | null;
  onRevokeInvite?: (inviteId: string) => void;
  onDiscardInvite?: (inviteId: string) => void;
  isLoading?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const QR_SIZE = Math.min(SCREEN_WIDTH * 0.35, 140);
const FULL_SCREEN_QR_SIZE = Math.min(SCREEN_WIDTH * 0.75, 350);

const PendingMemberBottomSheet: React.FC<PendingMemberBottomSheetProps> = ({
  invite,
  onRevokeInvite,
  onDiscardInvite,
  isLoading = false,
}) => {
  const { themedColors, currentTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isFullScreenVisible, setIsFullScreenVisible] = useState(false);

  const qrValue = useMemo(() => {
    if (!invite?.invite_code) return "";
    return `domus://invite/${invite.invite_code}`;
  }, [invite?.invite_code]);

  if (!invite) return null;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getExpiryDate = (createdAt: string): string => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCopyCode = async () => {
    if (invite.invite_code) {
      await Clipboard.setStringAsync(invite.invite_code);
      showSuccessToast("Invite code copied", null, 2000);
    }
  };

  const handleShareViaSms = async () => {
    const message = buildInviteMessage(
      invite.invitee_name || "there",
      invite.role,
      invite.invite_code
    );
    const success = await shareViaSms(invite.user_phone_number, message);
    if (!success) {
      showErrorToast("Unable to open SMS", null, 2000);
    }
  };

  const handleShareUniversal = async () => {
    const message = buildInviteMessage(
      invite.invitee_name || "there",
      invite.role,
      invite.invite_code
    );
    await shareUniversal("Domus Invite", message);
  };

  const handleQRCodePress = () => {
    setIsFullScreenVisible(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreenVisible(false);
  };

  const handleRevokePress = () => {
    if (isLoading || !onRevokeInvite) return;
    Alert.alert(
      "Revoke Invitation",
      `Are you sure you want to revoke the invitation for ${invite.invitee_name || formatPhoneForDisplay(invite.user_phone_number)}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Revoke",
          onPress: () => onRevokeInvite(invite.id),
          style: "destructive",
        },
      ]
    );
  };

  const handleDiscardPress = () => {
    if (isLoading || !onDiscardInvite) return;
    Alert.alert(
      "Delete Invitation",
      `Are you sure you want to delete the invitation for ${invite.invitee_name || formatPhoneForDisplay(invite.user_phone_number)}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => onDiscardInvite(invite.id),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <>
      <View className="flex-1" style={{ paddingBottom: insets.bottom + 32 }}>
        <View className="px-6 pt-4">
          <View className="flex-row items-center mb-4">
            <ProfileIcon
              username={invite.invitee_name || "Invited"}
              size={52}
            />
            <View className="flex-1 ml-4">
              <ThemedText className="text-lg font-uber-move-medium tracking-wide">
                {invite.invitee_name || "Invited Member"}
              </ThemedText>
              <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide mt-0.5">
                {formatPhoneForDisplay(invite.user_phone_number)}
              </ThemedTextSecondary>
            </View>

            <View
              className="px-3 py-1.5 rounded-md flex-row items-center gap-x-1.5"
              style={{ backgroundColor: themedColors.accent + "20" }}
            >
              <HourglassEndIcon
                width={10}
                height={10}
                color={themedColors.accent}
              />
              <ThemedText
                className="text-xs font-lato-medium"
                style={{ color: themedColors.accent }}
              >
                Pending
              </ThemedText>
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
            <View
              className="flex-row items-center justify-between py-3 px-4"
              style={{
                borderBottomWidth: 1,
                borderColor:
                  currentTheme === "dark"
                    ? themedColors.border + "30"
                    : themedColors.border,
              }}
            >
              <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
                Role
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-lato-regular">
                {capitalizeFirstLetterOfWords(invite.role)}
              </ThemedText>
            </View>

            <View
              className="flex-row items-center justify-between py-3 px-4"
              style={{
                borderBottomWidth: 1,
                borderBottomColor:
                  currentTheme === "dark"
                    ? themedColors.border + "30"
                    : themedColors.border,
              }}
            >
              <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
                Invited On
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-lato-regular">
                {formatDate(invite.created_at)}
              </ThemedText>
            </View>

            <View className="flex-row items-center justify-between py-3 px-4">
              <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider">
                Expires On
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-lato-regular">
                {getExpiryDate(invite.created_at)}
              </ThemedText>
            </View>
          </View>

          <View
            className="rounded-md p-4 flex-row items-center mt-4"
            style={{
              backgroundColor: themedColors.cardBackground,
              borderWidth: 1,
              borderColor:
                currentTheme === "dark"
                  ? themedColors.border + "30"
                  : themedColors.border,
            }}
          >
            <TouchableOpacity
              onPress={handleQRCodePress}
              activeOpacity={0.8}
              className="rounded-sm overflow-hidden p-2"
              style={{ backgroundColor: themedColors.qrBackground,
                borderColor: themedColors.border }}
            >
              <QRCode
                value={qrValue}
                size={QR_SIZE}
                logo={logoImage}
                logoSize={39}
                logoBackgroundColor={
                  currentTheme === "dark"
                    ? themedColors.qrBackground
                    : themedColors.text
                }
                logoMargin={14}
                logoBorderRadius={0}
                color={themedColors.text}
                backgroundColor={"transparent"}
              />
            </TouchableOpacity>

            <View className="flex-1 ml-4">
              <View className="flex-row items-center">
                <QRIcon width={16} height={16} color={themedColors.text} />
                <ThemedText className="text-sm font-uber-move-medium tracking-wide ml-2">
                  Scan to Join
                </ThemedText>
              </View>
              <ThemedTextSecondary className="text-xs font-lato-regular tracking-wide mt-1">
                Or share the invite code
              </ThemedTextSecondary>

              <TouchableOpacity
                className="flex-row items-center mt-3 border px-3 py-2 rounded-md"
                style={{ borderColor: themedColors.border }}
                onPress={handleCopyCode}
                activeOpacity={0.6}
              >
                <ThemedText className="text-sm font-uber-move-medium tracking-wide flex-1">
                  {invite.invite_code}
                </ThemedText>
                <CopyIcon width={14} height={14} color={themedColors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row mt-4">
            <TouchableOpacity
              onPress={handleShareViaSms}
              activeOpacity={0.7}
              className="flex-1 flex-row items-center justify-center py-3 rounded-md mr-2"
              style={{
                backgroundColor: themedColors.accent,
              }}
            >
              <EnvelopeIcon
                width={16}
                height={16}
                color={themedColors.textOnAccent}
              />
              <ThemedText
                className="text-sm font-uber-move-medium ml-2"
                style={{ color: themedColors.textOnAccent }}
              >
                Send SMS
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShareUniversal}
              activeOpacity={0.7}
              className="flex-1 flex-row items-center justify-center py-3 rounded-md ml-2"
              style={{
                backgroundColor: themedColors.cardBackground,
                borderWidth: 1,
                borderColor:
                  currentTheme === "dark"
                    ? themedColors.border + "50"
                    : themedColors.border,
              }}
            >
              <PaperPlaneIcon width={14} height={14} color={themedColors.text} />
              <ThemedText className="text-sm font-uber-move-medium ml-2">
                Share
              </ThemedText>
            </TouchableOpacity>
          </View>

          {onRevokeInvite && (
            <TouchableOpacity
              onPress={handleRevokePress}
              disabled={isLoading}
              className="mt-6 py-2 items-center"
              style={{
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <ThemedText
                className="text-sm font-uber-move-medium tracking-wider"
                style={{
                  color: themedColors.error,
                  textDecorationLine: "underline",
                }}
              >
                Revoke Invitation
              </ThemedText>
            </TouchableOpacity>
          )}

          {onDiscardInvite && (
            <TouchableOpacity
              onPress={handleDiscardPress}
              disabled={isLoading}
              className="mt-6 py-2 items-center flex-row justify-center gap-x-3 self-center px-2"
              style={{
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <TrashXmarkIcon width={16} height={16} color={themedColors.error} />
              <ThemedText
                className="text-sm font-uber-move-medium tracking-wider pb-0 border-b"
                style={{
                  color: themedColors.error,
                  borderBottomColor: themedColors.error,
                }}
              >
                Delete Invitation
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
        visible={isFullScreenVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseFullScreen}
      >
        <TouchableOpacity
          style={styles.fullScreenBackdrop}
          activeOpacity={1}
          onPress={handleCloseFullScreen}
        >
          <View style={styles.fullScreenContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View
                className="rounded-md p-6"
                style={{ ...styles.fullScreenQRContainer, backgroundColor: themedColors.qrBackground, borderColor: themedColors.border }}
              >
                <QRCode
                value={qrValue}
                size={FULL_SCREEN_QR_SIZE}
                logo={logoImage}
                logoSize={60}
                logoBackgroundColor={
                  currentTheme === "dark"
                    ? themedColors.qrBackground
                    : themedColors.text
                }
                logoMargin={14}
                logoBorderRadius={0}
                color={themedColors.text}
                backgroundColor={"transparent"}
              />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fullScreenBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  fullScreenQRContainer: {
    padding: 24,
    borderRadius: 16,
  },
});

export default PendingMemberBottomSheet;
