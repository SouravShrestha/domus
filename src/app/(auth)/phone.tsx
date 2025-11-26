import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

import LoadingModal from "@components/widgets/LoadingModal";
import ArrowIcon from "@components/icons/ArrowIcon";
import LockIcon from "@components/icons/LockIcon";
import { useTheme } from "@contexts/themeContext";
import {
  ThemedSafeAreaView,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { sendOtp as sendOtpService } from "@api/services/auth.service";
import { ROUTES } from "@constants/routes";
import basicColors from "@themes/colors";
import { formatPhoneForApi, formatPhoneForDisplay } from "@utils/phoneHelpers";

export default function Phone() {
  const router = useRouter();
  const { themedColors } = useTheme();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = phone.length === 10;

  const handleChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "");
    if (digitsOnly.length <= 10) setPhone(digitsOnly);
  };

  const confirmAndSendOtp = () => {
    if (!isValid || loading) return;

    Alert.alert(
      "We need to verify your number",
      `Make sure that ${formatPhoneForDisplay(phone)} is your correct number.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: sendOtp },
      ],
      { cancelable: true }
    );
  };

  const sendOtp = async () => {
    setLoading(true);
    setError("");

    try {
      await sendOtpService(formatPhoneForApi(phone));
      router.push({
        pathname: ROUTES.AUTH.VERIFY,
        params: { phone },
      });
    } catch (e) {
      setError(
        e?.message?.includes("Failed to send OTP")
          ? "Could not send OTP. Please try again."
          : "Something went wrong. Try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedSafeAreaView className="flex-1">
      <StatusBar barStyle="default" animated />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        className="flex-1"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="ml-3 mt-4 w-10 h-10 items-center justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowIcon width={32} height={32} stroke={themedColors.text} />
        </TouchableOpacity>

        <View className="flex-1 px-6 pt-4 pb-4 justify-between">
          {/* Top */}
          <View>
            <ThemedText className="text-4xl font-uber-move-medium">
              What's your phone number?
            </ThemedText>
            <ThemedTextSecondary className="text-base mt-2 font-lato-regular">
              We'll send you an OTP to verify it.
            </ThemedTextSecondary>

            {/* Phone Input */}
            <View className="mt-8 flex-row items-center">
              {/* Country */}
              <View className="mr-2">
                <ThemedText className="mb-1 ml-1 font-lato-regular">
                  Country
                </ThemedText>
                <View
                  className="rounded-md px-3 border justify-center"
                  style={{ height: 48, borderColor: themedColors.border }}
                >
                  <ThemedText className="font-semibold text-base font-uber-move-medium tracking-wider">
                    IN +91
                  </ThemedText>
                </View>
              </View>

              {/* Phone */}
              <View className="flex-1">
                <ThemedText className="mb-1 ml-1 font-lato-regular">
                  Phone Number
                </ThemedText>
                <TextInput
                  className="rounded-md px-4 border font-uber-move-medium tracking-wider"
                  style={{
                    height: 48,
                    fontSize: 16,
                    borderColor: themedColors.border,
                    color: themedColors.text,
                  }}
                  keyboardType="phone-pad"
                  autoFocus
                  value={phone}
                  onChangeText={handleChange}
                  maxLength={10}
                />
              </View>
            </View>

            {/* Error */}
            {!!error && (
              <Text
                className="text-sm mt-2 text-right font-lato-regular"
                style={{ color: basicColors.error }}
              >
                {error}
              </Text>
            )}
          </View>

          {/* Bottom */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center w-4/6">
              <LockIcon
                stroke={themedColors.secondaryText}
                width={16}
                height={16}
              />
              <ThemedTextSecondary className="text-xs ml-2 font-lato-regular tracking-wider">
                A one-time password will be sent to this number.
              </ThemedTextSecondary>
            </View>

            <TouchableOpacity
              disabled={!isValid}
              onPress={confirmAndSendOtp}
              className="rounded-full w-16 h-16 items-center justify-center"
              style={{
                backgroundColor: isValid
                  ? themedColors.accent
                  : themedColors.disabled,
              }}
            >
              <View className="ml-1.5" style={{ transform: [{ scaleX: -1 }] }}>
                <ArrowIcon
                  width={28}
                  height={28}
                  stroke={themedColors.textOnAccent}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <LoadingModal visible={loading} message="Sending OTP" />
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
}
