import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Alert,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ArrowIcon from "@components/icons/ArrowIcon";
import TimerIcon from "@components/icons/TimerIcon";
import LoadingModal from "@components/widgets/LoadingModal";
import { useTheme } from "@contexts/themeContext";
import basicColors, { themeColors } from "@themes/colors";
import { formatPhoneForApi, formatPhoneForDisplay } from "@utils/phoneHelpers";
import {
  verifyOtp as verifyOtpService,
  sendOtp as sendOtpService,
} from "@/api/auth.service";
import {
  ThemedSafeAreaView,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useAuth } from "@contexts/authContext";
import { fetchProfile } from "@/api/profile.service";
import { ROUTES } from "@/constants/routes";

const Verify: React.FC = () => {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];
  const { refreshSessionOnly, refreshProfile } = useAuth();

  const isValid = otp.length === 6;

  const handleChange = (text: string): void => {
    const digitsOnly = text.replace(/\D/g, "").slice(0, 6);
    setOtp(digitsOnly);
  };

  const handleVerifyOtp = async (): Promise<void> => {
    inputRef.current?.blur();
    setLoadingMessage("Verifying OTP");
    setLoading(true);
    setError("");

    try {
      const { data, error: verifyError } = await verifyOtpService(
        formatPhoneForApi(phone),
        otp
      );

      if (verifyError) {
        throw verifyError;
      }

      if (data?.session) {
        setLoadingMessage("Checking your profile");
        await refreshSessionOnly(data.session);

        const userId = data.session.user.id;
        const { data: profile } = await fetchProfile(userId);

        setLoading(false);

        setTimeout(async () => {
          if (profile?.onboarded_basic) {
            await refreshProfile();
            router.replace(ROUTES.TABS.HOME);
          } else {
            router.replace(ROUTES.AUTH.REGISTER);
          }
        }, 300);
      } else {
        throw new Error("No session returned");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(
        errorMessage.includes("token") ||
          errorMessage.includes("OTP") ||
          (err as { status?: number })?.status === 403
          ? "The OTP you entered is incorrect. Please try again."
          : "Could not verify OTP. Try again in a moment."
      );
      setSecondsLeft(0);
    } finally {
      setLoading(false);
    }
  };

  const confirmResendOtp = (): void => {
    Alert.alert(
      "Resend OTP?",
      "Heads up! It might take a few seconds to land in your inbox. Still wanna resend?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Resend", onPress: handleResendOtp },
      ]
    );
  };

  const handleResendOtp = async (): Promise<void> => {
    inputRef.current?.focus();
    setLoadingMessage("Resending OTP");
    setLoading(true);
    setError("");

    try {
      const { error: sendError } = await sendOtpService(
        formatPhoneForApi(phone)
      );

      if (sendError) {
        throw sendError;
      }

      setSecondsLeft(30);
      setOtp("");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(
        errorMessage.includes("Failed to send OTP") ||
          errorMessage.includes("OTP")
          ? "Could not send OTP. Please try again."
          : "Something went wrong. Try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timerId = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [secondsLeft]);

  return (
    <ThemedSafeAreaView className="flex-1">
      <StatusBar barStyle="default" animated={true} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        className="flex-1"
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="ml-3 mt-4 w-10 h-10 items-center justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowIcon width={32} height={32} stroke={colors.text} />
        </TouchableOpacity>

        <View className="flex-1 px-6 pt-4 pb-4 justify-between">
          {/* Top */}
          <View>
            <ThemedText className="text-4xl font-uber-move-medium">
              Verify your number
            </ThemedText>
            <ThemedTextSecondary className="text-base mt-4 font-lato-regular">
              Enter the code we've sent by text to{"\n"}
              {formatPhoneForDisplay(phone)}
            </ThemedTextSecondary>

            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-2 mb-8"
            >
              <ThemedText className="underline font-uber-move-medium">
                Change number
              </ThemedText>
            </TouchableOpacity>

            <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
              <View className="flex-row justify-between">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    className="w-12 h-12 rounded-sm border-2 items-center justify-center"
                    style={{
                      borderColor:
                        otp.length === i ? colors.accent : colors.border,
                    }}
                  >
                    <ThemedText className="text-xl font-uber-move-medium">
                      {otp[i] ?? ""}
                    </ThemedText>
                  </View>
                ))}

                {/* Hidden Input */}
                <TextInput
                  ref={inputRef}
                  value={otp}
                  onChangeText={handleChange}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{ position: "absolute", opacity: 0 }}
                  autoFocus
                />
              </View>
            </TouchableWithoutFeedback>

            <View className="mt-8 items-end">
              {secondsLeft > 0 ? (
                <ThemedText className="text-sm leading-6 ml-2 font-lato-regular text-right">
                  OTP sent. {"\n"}It should arrive within{" "}
                  <ThemedText className="inline-block">
                    {secondsLeft}
                  </ThemedText>{" "}
                  seconds
                </ThemedText>
              ) : (
                <TouchableOpacity onPress={confirmResendOtp}>
                  <ThemedText className="font-uber-move-medium underline text-sm">
                    Resend OTP
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            {!!error && (
              <View className="mt-4">
                <Text
                  className="font-medium text-sm text-right font-lato-regular"
                  style={{ color: basicColors.error }}
                >
                  {error}
                </Text>
              </View>
            )}
          </View>

          {/* Bottom Section */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center w-4/6">
              <TimerIcon stroke={colors.secondaryText} width={16} height={16} />
              <ThemedTextSecondary className="text-xs leading-5 ml-2.5 font-lato-regular tracking-wider">
                Your OTP is valid for 2 minutes. Please enter it before time
                runs out.
              </ThemedTextSecondary>
            </View>

            <TouchableOpacity
              disabled={!isValid}
              className="rounded-full w-16 h-16 items-center justify-center self-end"
              onPress={handleVerifyOtp}
              style={{
                backgroundColor: isValid ? colors.accent : colors.disabled,
              }}
            >
              <View style={{ transform: [{ scaleX: -1 }] }} className="ml-1.5">
                <ArrowIcon
                  width={28}
                  height={28}
                  stroke={colors.textOnAccent}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <LoadingModal visible={loading} message={loadingMessage} />
    </ThemedSafeAreaView>
  );
};

export default Verify;
