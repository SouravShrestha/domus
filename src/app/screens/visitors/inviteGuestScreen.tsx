import React, { useState } from "react";
import {
  StatusBar,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
  ThemedHR,
} from "@themes/themedComponents";
import { router } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { useAuth } from "@/contexts/authContext";
import { useResidence } from "@/contexts/residenceContext";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { createGuestInvitation } from "@/api/services/visitor.service";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { addHours, setHours, setMinutes, startOfDay } from "date-fns";
import Divider from "@/components/widgets/Divider";
import VisitTimePickerButton from "@/components/widgets/VisitTimePickerButton";
import VisitTimePickerModal from "@/components/widgets/VisitTimePickerModal";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { Route } from "expo-router/build/Route";
import { ROUTES } from "@/constants/routes";

const InviteGuestScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const { user } = useAuth();
  const { currentResidence } = useResidence();
  const insets = useSafeAreaInsets();

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const now = new Date();
  const defaultStartTime = setMinutes(setHours(new Date(), now.getHours() + 1), 0);
  const defaultEndTime = addHours(defaultStartTime, 2);

  const [validFrom, setValidFrom] = useState(defaultStartTime);
  const [validUntil, setValidUntil] = useState(defaultEndTime);
  const [isInTimeAny, setIsInTimeAny] = useState(true);
  const [isOutTimeAny, setIsOutTimeAny] = useState(true);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setGuestPhone(cleaned);
  };

  const validateForm = (): boolean => {
    if (!guestName.trim()) {
      showErrorToast("Please enter guest name");
      return false;
    }
    if (guestPhone.length < 10) {
      showErrorToast("Please enter a valid phone number");
      return false;
    }
    if (!currentResidence) {
      showErrorToast("No residence selected");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const finalValidFrom = isInTimeAny 
        ? setMinutes(setHours(startOfDay(validFrom), 0), 0)
        : validFrom;
      
      const finalValidUntil = isOutTimeAny
        ? setMinutes(setHours(startOfDay(validUntil), 23), 59)
        : validUntil;

      const { data, error } = await createGuestInvitation({
        residence_id: currentResidence!.id,
        invited_by_user_id: user!.id,
        visitor_name: guestName.trim(),
        visitor_phone: guestPhone,
        purpose: purpose.trim() || undefined,
        valid_from: finalValidFrom.toISOString(),
        valid_until: finalValidUntil.toISOString(),
        vehicle_number: vehicleNumber.trim() || undefined,
      });

      if (error) {
        throw error;
      }

      showSuccessToast("Guest invitation created successfully");
      router.replace(ROUTES.SCREENS.VISITORS.MANAGE_VISITORS);
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to create invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    guestName.trim() && guestPhone.length >= 10 && currentResidence;

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View
          className="pb-2 mx-3"
          style={{
            paddingTop: insets.top + 16,
          }}
        >
          <ThemedHeaderWithBack
            onBackPress={() => router.back()}
            title="invite a guest"
          />
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          <View className="mt-4">
            <View>
              <ThemedText className="font-uber-move-medium tracking-wide mb-2 ml-1 text-sm">
                Full name
              </ThemedText>
              <TextInput
                className="rounded-md px-4 border font-uber-move-medium tracking-wider"
                style={{
                  height: 48,
                  fontSize: 16,
                  color: themedColors.text,
                  borderColor: themedColors.lightBorder,
                  backgroundColor: themedColors.inputBackground,
                }}
                placeholder="Guest's full name"
                placeholderTextColor={themedColors.placeholderText}
                value={guestName}
                onChangeText={setGuestName}
                autoCapitalize="words"
              />
            </View>

            <View className="mt-4">
              <ThemedText className="font-uber-move-medium tracking-wide mb-2 ml-1 text-sm">
                Phone Number
              </ThemedText>
              <View className="flex-row items-center">
                <View
                  className="mr-2 px-4 border rounded-md items-center justify-center"
                  style={{
                    borderColor: themedColors.lightBorder,
                    height: 48,
                    backgroundColor: themedColors.inputBackground,
                  }}
                >
                  <ThemedText className="font-uber-move-medium text-base tracking-wider">
                    +91
                  </ThemedText>
                </View>
                <TextInput
                  className="rounded-md px-4 border font-uber-move-medium flex-1 tracking-wider"
                  style={{
                    height: 48,
                    fontSize: 16,
                    color: themedColors.text,
                    borderColor: themedColors.lightBorder,
                    backgroundColor: themedColors.inputBackground,
                  }}
                  keyboardType="phone-pad"
                  placeholder="Phone number"
                  placeholderTextColor={themedColors.placeholderText}
                  value={guestPhone}
                  onChangeText={handlePhoneChange}
                  maxLength={10}
                />
              </View>
            </View>
          </View>

          <Divider style={{ marginBottom: 24, marginTop: 28 }} />

          <View>
            <VisitTimePickerButton
              inTime={validFrom}
              outTime={validUntil}
              isInTimeAny={isInTimeAny}
              isOutTimeAny={isOutTimeAny}
              onPress={() => setIsTimePickerVisible(true)}
            />
          </View>

          <VisitTimePickerModal
            visible={isTimePickerVisible}
            onClose={() => setIsTimePickerVisible(false)}
            onConfirm={(inTime, outTime, inTimeAny, outTimeAny) => {
              setValidFrom(inTime);
              setValidUntil(outTime);
              setIsInTimeAny(inTimeAny);
              setIsOutTimeAny(outTimeAny);
              setIsTimePickerVisible(false);
            }}
            initialInTime={validFrom}
            initialOutTime={validUntil}
            initialIsInTimeAny={isInTimeAny}
            initialIsOutTimeAny={isOutTimeAny}
          />

          <Divider style={{ marginBottom: 24, marginTop: 28 }} />

          <View>
            <View>
              <View className="w-full flex-row items-center justify-between">
                <ThemedText className="font-uber-move-medium tracking-wide mb-2 ml-1 text-sm">
                  Purpose of Visit
                </ThemedText>
                <ThemedTextSecondary className="text-xs font-lato-regular">Optional</ThemedTextSecondary>
              </View>
              <TextInput
                className="rounded-md px-4 border font-uber-move-medium tracking-wider"
                style={{
                  height: 48,
                  fontSize: 16,
                  color: themedColors.text,
                  borderColor: themedColors.lightBorder,
                  backgroundColor: themedColors.inputBackground,
                }}
                placeholder="Family visit, Birthday party"
                placeholderTextColor={themedColors.placeholderText}
                value={purpose}
                onChangeText={setPurpose}
              />
            </View>

            <View className="mt-4">
              <View className="w-full flex-row items-center justify-between">
                <ThemedText className="font-uber-move-medium tracking-wide mb-2 ml-1 text-sm">
                  Vehicle Number
                </ThemedText>
                <ThemedTextSecondary className="text-xs font-lato-regular">Optional</ThemedTextSecondary>
              </View>
              <TextInput
                className="rounded-md px-4 border font-uber-move-medium tracking-wider"
                style={{
                  height: 48,
                  fontSize: 16,
                  color: themedColors.text,
                  borderColor: themedColors.lightBorder,
                  backgroundColor: themedColors.inputBackground,
                }}
                placeholder="KA01AB1234"
                placeholderTextColor={themedColors.placeholderText}
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="rounded-md items-center justify-center mt-10"
            style={{
              height: 54,
              backgroundColor: isFormValid
                ? themedColors.buttonBackground
                : themedColors.lightBorder,
            }}
          >
            <ThemedText
              className="font-uber-move-bold text-base tracking-wider"
              style={{
                color: isFormValid
                  ? themedColors.buttonText
                  : themedColors.text,
                opacity: isFormValid ? 1 : 0.4,
              }}
            >
              Create Invitation
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      {isSubmitting && <LoadingOverlay currentTheme={currentTheme} withToast={false} />}
    </ThemedView>
  );
};

export default InviteGuestScreen;
