import React, { useRef } from "react";
import { StatusBar, View, TouchableOpacity } from "react-native";
import { ThemedText, ThemedTextSecondary, ThemedView } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import CopyIcon from "@/components/icons/CopyIcon";
import SmsIcon from "@/components/icons/SmsIcon";
import ShareIcon from "@/components/icons/ShareIcon";
import {
  copyToClipboard,
  shareViaSms,
  shareUniversal,
  buildInviteMessage,
  shareQRCodeImage,
} from "@/utils/qrHelpers";
import { showSuccessToast } from "@/utils/toast";
import logoImage from "@assets/icons/splash-icon-light.png";
import { BadgeCheckIcon, QRIcon } from "@/components/icons";

const InviteSentSuccessScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const colors = themeColors[currentTheme];
  const insets = useSafeAreaInsets();
  const qrRef = useRef<ViewShot>(null);
  const params = useLocalSearchParams<{
    name: string;
    phone: string;
    role: string;
    inviteCode?: string;
  }>();

  const inviteCode = params.inviteCode || "xxxxxx";

  const handleCopyCode = async () => {
    const success = await copyToClipboard(inviteCode);
    if (success) {
      showSuccessToast("Code copied");
    }
  };

  const handleShareViaSms = async () => {
    const message = buildInviteMessage(
      params.name || "",
      params.role || "",
      inviteCode
    );
    await shareViaSms(params.phone || "", message);
  };

  const handleUniversalShare = async () => {
    try {
      if (qrRef.current?.capture) {
        const uri = await qrRef.current.capture();
        const message = buildInviteMessage(
          params.name || "",
          params.role || "",
          inviteCode
        );
        await shareQRCodeImage(uri, message);
      }
    } catch {
      const message = buildInviteMessage(
        params.name || "",
        params.role || "",
        inviteCode
      );
      await shareUniversal("Domus Invitation", message);
    }
  };

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <View
        className="pb-2 mx-3 flex-1"
        style={{
          paddingTop: insets.top + 16,
        }}
      >
        <ThemedHeaderWithBack onBackPress={() => router.back()} title="" />

        <View className="flex-row items-center mt-4">
          <ThemedText className="text-2xl font-uber-move-medium tracking-wider text-left ml-4">
            Invite Created Successfully
          </ThemedText>
          <View className="ml-2 mt-0.5">
            <BadgeCheckIcon
              width={18}
              height={18}
              color={themedColors.success}
            />
          </View>
        </View>

        <View
          className="flex-1 justify-between"
          style={{ marginTop: 6, marginBottom: insets.bottom + 16 }}
        >
          <View>
            <View className="flex-row items-center mt-8 mx-4 justify-center">
              <QRIcon width={20} height={20} color={themedColors.text} />
              <ThemedText className="text-lg font-uber-move-medium tracking-wider ml-3">
                Share Invite
              </ThemedText>
            </View>

            <ThemedTextSecondary className="text-sm font-lato-regular tracking-wider mt-2 text-center">
              Scan the QR code or manually share the code.
            </ThemedTextSecondary>
          </View>

          <View className="items-center">
            <ViewShot
              ref={qrRef}
              options={{ format: "png", quality: 1 }}
            >
              <View
                className="p-4 rounded-sm border"
                style={{
                  backgroundColor: themedColors.qrBackground,
                  borderColor: colors.border,
                }}
              >
                <QRCode
                  value={inviteCode}
                  size={200}
                  logo={logoImage}
                  logoSize={48}
                  logoBackgroundColor={
                    currentTheme === "dark" ? colors.qrBackground : colors.text
                  }
                  logoMargin={14}
                  logoBorderRadius={0}
                  color={colors.text}
                  backgroundColor={"transparent"}
                />
              </View>
            </ViewShot>

            <View className="mt-6 justify-between flex items-center">
              <View className="flex items-center">
                <ThemedText className="text-base font-uber-move-medium tracking-wider">
                  Can't scan?
                </ThemedText>
                <ThemedTextSecondary className="text-sm font-lato-regular tracking-wider">
                  Enter the code manually
                </ThemedTextSecondary>
              </View>
              <TouchableOpacity
                className="flex-row items-center mt-3 border-b px-2 py-1 rounded-md"
                style={{ borderColor: themedColors.border }}
                onPress={handleCopyCode}
                activeOpacity={0.4}
              >
                <ThemedText className="text-base font-uber-move-medium tracking-widest mr-2">
                  {inviteCode}
                </ThemedText>
                <CopyIcon width={16} height={16} color={themedColors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-col-reverse px-10 gap-x-4 justify-center">
            <TouchableOpacity
              onPress={handleUniversalShare}
              className="flex-row items-center justify-center py-2 px-4 rounded-sm mt-4"
            >
              <ShareIcon width={20} height={20} color={colors.text} />
              <ThemedText className="ml-3 font-uber-move-medium text-base">
                More share options
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShareViaSms}
              className="flex-row items-center justify-center py-4 px-4 rounded-md"
              style={{ backgroundColor: colors.buttonBackground }}
            >
              <SmsIcon width={20} height={20} color={colors.buttonText} />
              <ThemedText
                className="ml-3 font-uber-move-medium text-base tracking-wider"
                style={{ color: colors.buttonText }}
              >
                Share via SMS
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ThemedView>
  );
};

export default InviteSentSuccessScreen;
