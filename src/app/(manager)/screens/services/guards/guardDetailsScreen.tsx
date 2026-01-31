import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
  ScrollView,
  Text,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useAuth } from "@contexts/authContext";
import { router, useLocalSearchParams } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import {
  capitalizeFirstLetterOfWords,
  cleanFullName,
} from "@utils/textHelpers";
import { ROUTES } from "@/constants/routes";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { assignOrInviteGuard } from "@api/services/guard.service";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { appEventEmitter, AppEvents } from "@/utils/eventEmitter";

const GuardDetailsScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    phone: string;
    name?: string;
    societyId: string;
    societyName: string;
  }>();

  const [name, setName] = useState<string>(
    capitalizeFirstLetterOfWords(cleanFullName(params.name || "")),
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (text: string) => {
    const cleaned = cleanFullName(text);
    setName(cleaned);
  };

  const handleConfirm = () => {
    Keyboard.dismiss();

    const capitalizedName = capitalizeFirstLetterOfWords(name.trim());
    setName(capitalizedName);

    Alert.alert("Confirm", `Add guard with phone ${params.phone}?`, [
      {
        text: "Cancel",
        style: "destructive",
      },
      {
        text: "Confirm",
        onPress: async () => {
          if (!params.societyId || !user?.id) {
            showErrorToast("Unable to add guard. Please try again.");
            return;
          }

          setIsLoading(true);
          try {
            const { data, error } = await assignOrInviteGuard(
              params.societyId,
              params.phone,
              "gate",
              user.id,
              capitalizedName || undefined,
            );

            if (error || !data) {
              throw error || new Error("Failed to add guard");
            }

            appEventEmitter.emit(AppEvents.GUARD_UPDATED);

            if (data.type === "assigned") {
              showSuccessToast("Guard added successfully");
              router.dismissTo(ROUTES.MANAGER.SCREENS.SERVICES.GUARDS.INDEX);
            } else {
              router.dismissTo(ROUTES.MANAGER.SCREENS.SERVICES.GUARDS.INDEX);
              router.push({
                pathname: ROUTES.MANAGER.SCREENS.SERVICES.GUARDS
                  .INVITE_SUCCESS as any,
                params: {
                  name: capitalizedName || "Guard",
                  phone: params.phone,
                  inviteCode: data.invite.invite_code,
                },
              });
            }
          } catch (error: any) {
            console.error("Error adding guard:", error);
            const errorMessage = error?.message?.includes("already exists")
              ? "This guard already exists for this society."
              : "Failed to add guard. Please try again.";
            showErrorToast(errorMessage);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ThemedView className="flex-1">
        <StatusBar barStyle="default" animated />
        <View
          className="pb-2 mx-3"
          style={{
            paddingTop: insets.top + 16,
          }}
        >
          <ThemedHeaderWithBack
            onBackPress={() => router.back()}
            title="Confirm Details"
          />
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-6 flex-col space-y-6">
            <View className="flex-row items-center">
              <View className="flex-1">
                <ThemedText className="font-uber-move-medium tracking-wider mb-2 ml-1">
                  Guard's name
                </ThemedText>
                <TextInput
                  className="rounded-md px-4 border font-uber-move-medium tracking-wider"
                  style={{
                    height: 48,
                    fontSize: 16,
                    color: themedColors.text,
                    borderColor: themedColors.border,
                  }}
                  keyboardType="default"
                  autoFocus={!params.name}
                  placeholder="Enter name"
                  placeholderTextColor={themedColors.placeholderText}
                  value={name}
                  onChangeText={handleNameChange}
                  onFocus={() => setName(cleanFullName(name))}
                  maxLength={30}
                />
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="flex-1">
                <ThemedText className="font-uber-move-medium tracking-wider mb-2 ml-1">
                  Phone Number
                </ThemedText>
                <View
                  className="rounded-md px-4 border font-uber-move-medium tracking-wider justify-center"
                  style={{
                    height: 48,
                    borderColor: themedColors.border,
                    backgroundColor: themedColors.disabled + "30",
                  }}
                >
                  <ThemedTextSecondary
                    className="font-uber-move-medium tracking-wider"
                    style={{ fontSize: 16 }}
                  >
                    {params.phone}
                  </ThemedTextSecondary>
                </View>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="flex-1">
                <ThemedText className="font-uber-move-medium tracking-wider mb-2 ml-1">
                  Society
                </ThemedText>
                <View
                  className="rounded-md px-4 border font-uber-move-medium tracking-wider justify-center"
                  style={{
                    height: 48,
                    borderColor: themedColors.border,
                    backgroundColor: themedColors.disabled + "30",
                  }}
                >
                  <ThemedTextSecondary
                    className="font-uber-move-medium tracking-wider"
                    style={{ fontSize: 16 }}
                  >
                    {params.societyName || "Society"}
                  </ThemedTextSecondary>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View
          className="px-5 pb-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <TouchableOpacity
            onPress={handleConfirm}
            className="rounded-lg py-4 items-center justify-center"
            style={{
              backgroundColor: themedColors.buttonBackground,
            }}
          >
            <Text
              className="font-uber-move-medium text-base tracking-wide"
              style={{ color: themedColors.buttonText }}
            >
              Add Guard
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <LoadingOverlay currentTheme={currentTheme} withToast={false} />
        )}
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default GuardDetailsScreen;
