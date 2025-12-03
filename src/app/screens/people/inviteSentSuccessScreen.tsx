import React, { useEffect } from "react";
import {
  BackHandler,
  Linking,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText, ThemedView } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import inviteImage from "@assets/images/invite-success.png";
import LottieView from "lottie-react-native";
import confettiAnimation from "@assets/animations/confetti.json";
import { ROUTES } from "@/constants/routes";
import { SmsIcon } from "@/components/icons";
import { Image } from "expo-image";
import basicColors from "@/themes/colors";

const InviteSentSuccessScreen: React.FC = () => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    name: string;
    phone: string;
    role: string;
    inviteCode?: string;
  }>();

  const handleShareViaMessage = async () => {
    const inviteCode = params.inviteCode || "DOMUS123";
    const message = `Hi ${params.name}! You've been invited to join our residence on Domus as ${params.role}. Use this invite code to get started: ${inviteCode}\n\nDownload Domus: https://domus.app`;

    const smsUrl = Platform.select({
      ios: `sms:${params.phone}&body=${encodeURIComponent(message)}`,
      android: `sms:${params.phone}?body=${encodeURIComponent(message)}`,
    });

    if (smsUrl) {
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
      }
    }
  };

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />

      <View
        className="flex-1 justify-center items-center px-8"
        style={{
          paddingBottom: insets.bottom + 24,
          paddingTop: insets.top + 64,
        }}
      >
        <View className="absolute top-0 left-8 right-0 h-[50vh] w-full rounded-full overflow-hidden opacity-59">
          <LottieView
            source={confettiAnimation}
            autoPlay
            loop={false}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </View>

        <View className="w-48 h-48 rounded-full items-center justify-center ml-4 overflow-hidden" style={{backgroundColor: basicColors.lightPink + "40" }}>
          <Image
            source={inviteImage}
            className="w-40 h-40 absolute -bottom-2"
            contentFit="contain"
          />
        </View>

        <ThemedText className="text-3xl font-uber-move-medium tracking-wider text-center mb-4 mt-4">
          Invitation created
        </ThemedText>

        <View className="flex-1" />

        <TouchableOpacity
          onPress={handleShareViaMessage}
          className="w-full py-4 rounded-2xl items-center flex-row justify-center mb-3"
          style={{
            backgroundColor: themedColors.accent,
          }}
        >
          <SmsIcon width={20} height={20} color={themedColors.textOnAccent} />
          <Text
            className="text-lg font-uber-move-medium tracking-wider ml-3"
            style={{ color: themedColors.textOnAccent }}
          >
            Share via Message
          </Text>
        </TouchableOpacity>

        <ThemedText
          className="text-xs font-lato-regular text-center mt-6 px-8 leading-5"
          style={{ color: themedColors.secondaryText }}
        >
          The invite will expire in 7 days if not accepted
        </ThemedText>
      </View>
    </ThemedView>
  );
};

export default InviteSentSuccessScreen;
