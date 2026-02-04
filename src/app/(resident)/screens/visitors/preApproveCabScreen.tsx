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
} from "@themes/themedComponents";
import { router } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import Divider from "@/components/widgets/Divider";
import VisitTimePickerButton from "@/components/widgets/VisitTimePickerButton";
import VisitTimePickerModal from "@/components/widgets/VisitTimePickerModal";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { addHours, setHours, setMinutes } from "date-fns";
import { DriverIcon } from "@/components/icons";
import basicColors from "@themes/colors";

const CAB_TYPES = [
  { id: "uber", label: "Uber", example: "Uber Go, Premier, etc." },
  { id: "ola", label: "Ola", example: "Ola Mini, Prime, etc." },
  { id: "rapido", label: "Rapido", example: "Bike, Auto" },
  { id: "other", label: "Other Cab", example: "Any other cab service" },
];

const PreApproveCabScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedType, setSelectedType] = useState<string>("");
  const [driverName, setDriverName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [notes, setNotes] = useState("");

  const now = new Date();
  const defaultStartTime = setMinutes(
    setHours(new Date(), now.getHours()),
    0
  );
  const defaultEndTime = addHours(defaultStartTime, 2);

  const [validFrom, setValidFrom] = useState(defaultStartTime);
  const [validUntil, setValidUntil] = useState(defaultEndTime);
  const [isInTimeAny, setIsInTimeAny] = useState(true);
  const [isOutTimeAny, setIsOutTimeAny] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    if (!selectedType) {
      showErrorToast("Please select a cab type");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showSuccessToast("Cab pre-approved successfully");
      router.back();
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to pre-approve cab");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedType !== "";

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
            title="pre-approve cab"
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
            <ThemedText className="font-uber-move-medium tracking-wide mb-3 ml-1 text-sm">
              Cab Service
            </ThemedText>
            <View style={{ gap: 10 }}>
              {CAB_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setSelectedType(type.id)}
                  className="flex-row items-center p-4 rounded-xl"
                  style={{
                    backgroundColor:
                      selectedType === type.id
                        ? themedColors.accent + "15"
                        : themedColors.cardBackground,
                    borderWidth: 1,
                    borderColor:
                      selectedType === type.id
                        ? themedColors.accent
                        : themedColors.lightBorder,
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{
                      backgroundColor:
                        selectedType === type.id
                          ? themedColors.accent + "20"
                          : basicColors.gold + "30",
                    }}
                  >
                    <DriverIcon
                      width={20}
                      height={20}
                      color={
                        selectedType === type.id
                          ? themedColors.accent
                          : themedColors.text
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-base font-uber-move-medium">
                      {type.label}
                    </ThemedText>
                    <ThemedTextSecondary className="text-xs font-lato-regular mt-0.5">
                      {type.example}
                    </ThemedTextSecondary>
                  </View>
                  <View
                    className="w-5 h-5 rounded-full border-2 items-center justify-center"
                    style={{
                      borderColor:
                        selectedType === type.id
                          ? themedColors.accent
                          : themedColors.lightBorder,
                    }}
                  >
                    {selectedType === type.id && (
                      <View
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: themedColors.accent }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
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
                  Driver Name
                </ThemedText>
                <ThemedTextSecondary className="text-xs font-lato-regular">
                  Optional
                </ThemedTextSecondary>
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
                placeholder="If known from the app"
                placeholderTextColor={themedColors.placeholderText}
                value={driverName}
                onChangeText={setDriverName}
                autoCapitalize="words"
              />
            </View>

            <View className="mt-4">
              <View className="w-full flex-row items-center justify-between">
                <ThemedText className="font-uber-move-medium tracking-wide mb-2 ml-1 text-sm">
                  Vehicle Number
                </ThemedText>
                <ThemedTextSecondary className="text-xs font-lato-regular">
                  Optional
                </ThemedTextSecondary>
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

            <View className="mt-4">
              <View className="w-full flex-row items-center justify-between">
                <ThemedText className="font-uber-move-medium tracking-wide mb-2 ml-1 text-sm">
                  Ride OTP
                </ThemedText>
                <ThemedTextSecondary className="text-xs font-lato-regular">
                  Optional
                </ThemedTextSecondary>
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
                placeholder="4-digit OTP"
                placeholderTextColor={themedColors.placeholderText}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            <View className="mt-4">
              <View className="w-full flex-row items-center justify-between">
                <ThemedText className="font-uber-move-medium tracking-wide mb-2 ml-1 text-sm">
                  Notes for Guard
                </ThemedText>
                <ThemedTextSecondary className="text-xs font-lato-regular">
                  Optional
                </ThemedTextSecondary>
              </View>
              <TextInput
                className="rounded-md px-4 border font-uber-move-medium tracking-wider"
                style={{
                  height: 80,
                  fontSize: 16,
                  color: themedColors.text,
                  borderColor: themedColors.lightBorder,
                  backgroundColor: themedColors.inputBackground,
                  textAlignVertical: "top",
                  paddingTop: 12,
                }}
                placeholder="Any special instructions"
                placeholderTextColor={themedColors.placeholderText}
                value={notes}
                onChangeText={setNotes}
                multiline
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
              Pre-approve Cab
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      {isSubmitting && (
        <LoadingOverlay currentTheme={currentTheme} withToast={false} />
      )}
    </ThemedView>
  );
};

export default PreApproveCabScreen;
