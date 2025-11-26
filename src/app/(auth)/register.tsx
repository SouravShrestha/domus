import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedSafeAreaView, ThemedText } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import basicColors, { themeColors } from "@themes/colors";
import LoadingModal from "@components/widgets/LoadingModal";
import ArrowIcon from "@components/icons/ArrowIcon";
import GenderPicker from "@components/widgets/GenderPicker";
import { useAuth } from "@contexts/authContext";
import { sanitizeName } from "@utils/textHelpers";
import { createProfile } from "@api/services/profile.service";
import { ROUTES } from "@constants/routes";
import { Gender } from "@enums/gender";
import { ensurePhoneHasPlusPrefix, formatPhoneForApi } from "@utils/phoneHelpers";

const Register: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [error, setError] = useState<string>("");
  const [isInvalidName, setIsInvalidName] = useState<boolean>(false);
  const [isInvalidEmail, setIsInvalidEmail] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];

  const isValid =
    name.length > 2 && gender !== null && !isInvalidName && !isInvalidEmail;

  const handleChange = (text: string) => {
    const sanitized = sanitizeName(text);

    if (/[^a-zA-Z ]/.test(sanitized)) {
      setError(
        "Name can only contain letters and spaces, no special characters"
      );
      setIsInvalidName(true);
    } else {
      setIsInvalidName(false);
      setError("");
    }

    setName(sanitized);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      setError("Please enter a valid email address.");
      setIsInvalidEmail(true);
    } else {
      setIsInvalidEmail(false);
      setError("");
    }
  };

  const handleCreateUser = async (): Promise<void> => {
    try {
      setError("");
      setIsInvalidName(false);
      setIsInvalidEmail(false);

      if (/[^a-zA-Z ]/.test(name)) {
        Keyboard.dismiss();
        setError(
          "Name can only contain letters and spaces, no special characters"
        );
        setIsInvalidName(true);
        return;
      }

      const cleanedName = sanitizeName(name);
      if (cleanedName.length < 3) {
        Keyboard.dismiss();
        setError("Name must be at least 3 letters.");
        return;
      }

      if (!gender) {
        Keyboard.dismiss();
        setError("Please select your identity.");
        return;
      }

      if (!user?.id) {
        Keyboard.dismiss();
        setError("You must verify your phone to create a profile.");
        return;
      }

      if (!user?.phone) {
        Keyboard.dismiss();
        setError("Phone number is required. Please verify your phone number.");
        return;
      }

      setLoadingMessage("Creating your profile");
      setLoading(true);

      const { error: createError } = await createProfile({
        id: user.id,
        name: cleanedName,
        phone: ensurePhoneHasPlusPrefix(user.phone),
        email: email.trim() || null,
        gender: gender,
        onboarded_basic: true,
      });

      if (createError) {
        throw createError;
      }

      await refreshProfile();

      setLoading(false);
      setTimeout(() => {
        router.replace(ROUTES.TABS.HOME);
      }, 300);
    } catch (err: unknown) {
      Keyboard.dismiss();
      let errorMessage = "";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === "object" && "message" in err) {
        errorMessage = String(err.message);
      } else {
        errorMessage = String(err);
      }

      const isDuplicateError =
        errorMessage.toLowerCase().includes("duplicate") ||
        errorMessage.toLowerCase().includes("unique") ||
        errorMessage.toLowerCase().includes("already exists");

      setError(
        isDuplicateError
          ? errorMessage ||
              "A profile with this email already exists. Please use a different email address."
          : "Oops! Couldn't create your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ThemedSafeAreaView className="flex-1">
        <StatusBar barStyle="default" animated />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          className="flex-1"
        >
          <View className="px-5 pb-4 pt-3 flex-col justify-between h-full">
            {/* Top Section */}
            <View>
              <View className="flex-row items-center gap-x-1 justify-start -ml-2">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="mt-2 w-10 h-10 items-start justify-top"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ArrowIcon width={32} height={32} stroke={colors.text} />
                </TouchableOpacity>
                <ThemedText className="text-2xl font-uber-move-medium">
                  Something about you !
                </ThemedText>
              </View>

              <View className="mt-6 flex-col space-y-6">
                {/* Name Field */}
                <View className="flex-row items-center">
                  <View className="flex-1">
                    <ThemedText className="font-lato-regular mb-2 ml-1">
                      What's your full name? *
                    </ThemedText>
                    <TextInput
                      className="rounded-md px-4 border font-lato-regular"
                      style={{
                        height: 48,
                        fontSize: 16,
                        color: colors.text,
                        borderColor: isInvalidName ? "red" : colors.border,
                      }}
                      keyboardType="default"
                      autoFocus
                      placeholder="Full name"
                      placeholderTextColor="#888"
                      value={name}
                      onChangeText={handleChange}
                      maxLength={30}
                    />
                  </View>
                </View>

                {/* Email Field */}
                <View className="flex-row items-center">
                  <View className="flex-1">
                    <ThemedText className="font-lato-regular mb-2 ml-1">
                      Do you have an email to share?
                    </ThemedText>
                    <TextInput
                      className="rounded-md px-4 border font-lato-regular"
                      style={{
                        height: 48,
                        fontSize: 16,
                        borderColor: isInvalidEmail ? "red" : colors.border,
                        color: colors.text,
                      }}
                      keyboardType="default"
                      placeholder="me@example.com"
                      placeholderTextColor={colors.placeholderText}
                      value={email}
                      onChangeText={handleEmailChange}
                      maxLength={30}
                    />
                  </View>
                </View>

                {/* Gender Field */}
                <View className="flex-row items-center mt-6">
                  <View className="flex-1">
                    <ThemedText className="font-lato-regular mb-2 ml-1">
                      How do you identify yourself? *
                    </ThemedText>
                    <GenderPicker
                      onSelect={(gender: string) => setGender(gender as Gender)}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Section */}
            <View className="flex-row items-center justify-between">
              {error ? (
                <View className="w-4/6">
                  <Text
                    className="font-medium text-sm text-left font-lato-regular"
                    style={{ color: basicColors.error }}
                  >
                    {error}
                  </Text>
                </View>
              ) : (
                <View />
              )}
              <TouchableOpacity
                disabled={!isValid}
                className="rounded-full w-16 h-16 items-center justify-center self-end"
                onPress={handleCreateUser}
                style={{
                  backgroundColor: isValid ? colors.accent : colors.disabled,
                }}
              >
                <View
                  style={{ transform: [{ scaleX: -1 }] }}
                  className="ml-1.5"
                >
                  <ArrowIcon
                    width={28}
                    height={28}
                    stroke={colors.textOnAccent}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <LoadingModal visible={loading} message={loadingMessage} />
        </KeyboardAvoidingView>
      </ThemedSafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Register;
