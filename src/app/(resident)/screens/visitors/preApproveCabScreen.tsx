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
import { useAuth } from "@/contexts/authContext";
import { useResidence } from "@/contexts/residenceContext";
import { createCabInvite } from "@/api/services/cab.service";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import Divider from "@/components/widgets/Divider";
import VisitTimePickerButton from "@/components/widgets/VisitTimePickerButton";
import VisitTimePickerModal from "@/components/widgets/VisitTimePickerModal";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { addHours, addMinutes, setHours, setMinutes } from "date-fns";
import CategoryPill from "@/components/widgets/CategoryPill";

const CAB_TYPES: {
  value: string;
  label: string;
  useImage?: boolean;
}[] = [
  { value: "uber", label: "Uber", useImage: true },
  { value: "ola", label: "Ola", useImage: true },
  { value: "rapido", label: "Rapido", useImage: true },
  { value: "other", label: "Other", useImage: true },
];

const PreApproveCabScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const { user } = useAuth();
  const { currentResidence } = useResidence();
  const insets = useSafeAreaInsets();

  const [selectedType, setSelectedType] = useState<string>("");
  const [driverName, setDriverName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [notes, setNotes] = useState("");

  const now = new Date();
  const defaultStartTime = setMinutes(setHours(new Date(), now.getHours()), 0);
  const defaultEndTime = addHours(defaultStartTime, 2);

  const [validFrom, setValidFrom] = useState(defaultStartTime);
  const [validUntil, setValidUntil] = useState(defaultEndTime);
  const [isInTimeAny, setIsInTimeAny] = useState(false);
  const [isOutTimeAny, setIsOutTimeAny] = useState(true);
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
      const finalValidFrom = isInTimeAny ? new Date() : validFrom;
      const finalValidUntil = addMinutes(finalValidFrom, 30);

      const { error } = await createCabInvite({
        residence_id: currentResidence!.id,
        invited_by_user_id: user!.id,
        cab_type: selectedType,
        driver_name: driverName.trim() || undefined,
        vehicle_number: vehicleNumber.trim() || undefined,
        valid_from: finalValidFrom.toISOString(),
        valid_until: finalValidUntil.toISOString(),
        notes: notes.trim() || undefined,
      });

      if (error) throw error;

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
            paddingTop: insets.top + 6,
          }}
        >
          <ThemedHeaderWithBack
            onBackPress={() => router.back()}
            title="pre-approve taxi"
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
            <ThemedText className="font-uber-move-medium tracking-wide mb-5 ml-1 text-sm">
              What do you want to approve?
            </ThemedText>
            <View className="flex-row flex-wrap">
              {CAB_TYPES.map((type) => (
                <CategoryPill
                  key={type.value}
                  label={type.label}
                  value={type.value}
                  isSelected={selectedType === type.value}
                  onPress={() => setSelectedType(type.value)}
                  imageKey={type.useImage ? type.value : undefined}
                  iconKey={type.useImage ? undefined : "driver"}
                />
              ))}
            </View>
          </View>

          <View className="mt-5">
            <VisitTimePickerButton
              inTime={validFrom}
              outTime={validUntil}
              isInTimeAny={isInTimeAny}
              isOutTimeAny={isOutTimeAny}
              hideOutTime
              onPress={() => setIsTimePickerVisible(true)}
            />
            <ThemedTextSecondary className="text-sm font-lato-regular mt-2 ml-1 tracking-wide">
              Valid for max 30 minutes from arrival time
            </ThemedTextSecondary>
          </View>

          <Divider style={{ marginBottom: 24, marginTop: 28 }} />

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
            hideOutTime
            hideAnyTime
          />

          <View className="mt-4">
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

            <View className="mt-8">
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

            <View className="mt-8">
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
