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
import { KeyIcon } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { createResidenceInvite } from "@api/services/invitation.service";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import basicColors from "@/themes/colors";

const OwnerDetailsScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    phone: string;
    name?: string;
    residenceId: string;
    residenceName: string;
    block: string;
    floorNumber: string;
  }>();

  const [name, setName] = useState<string>(
    capitalizeFirstLetterOfWords(cleanFullName(params.name || "")),
  );
  const [isLoading, setIsLoading] = useState(false);

  const isValid = name.length > 0;

  const handleNameChange = (text: string) => {
    const cleaned = cleanFullName(text);
    setName(cleaned);
  };

  const handleSendInvite = () => {
    Keyboard.dismiss();

    const capitalizedName = capitalizeFirstLetterOfWords(name.trim());
    setName(capitalizedName);

    if (!capitalizedName) {
      return;
    }

    Alert.alert(
      "Confirm Invitation",
      `Create invitation for ${capitalizedName} as Owner of ${params.residenceName}?`,
      [
        {
          text: "Cancel",
          style: "destructive",
        },
        {
          text: "Invite",
          onPress: async () => {
            if (!params.residenceId || !user?.id) {
              showErrorToast("Unable to create invitation. Please try again.");
              return;
            }

            setIsLoading(true);
            try {
              const { data, error } = await createResidenceInvite(
                params.phone,
                params.residenceId,
                "owner",
                user.id,
                true,
                capitalizedName,
                params.residenceName,
              );

              if (error || !data) {
                throw error || new Error("Failed to create invitation");
              }

              showSuccessToast("Invitation created successfully");
              router.dismissTo({
                pathname: ROUTES.MANAGER.SCREENS.RESIDENCES.MANAGE_OWNERS,
                params: {
                  residenceId: params.residenceId,
                  residenceName: params.residenceName,
                  block: params.block,
                  floorNumber: params.floorNumber,
                },
              });
              router.push({
                pathname: ROUTES.MANAGER.SCREENS.RESIDENCES.INVITE_SUCCESS,
                params: {
                  name: capitalizedName,
                  phone: params.phone,
                  role: "Owner",
                  inviteCode: data.invite_code,
                  residenceName: params.residenceName,
                  block: params.block,
                  floorNumber: params.floorNumber,
                },
              });
            } catch (error: unknown) {
              console.error("Error creating invitation:", error);
              const errorMessage = (error as Error)?.message?.includes(
                "already exists",
              )
                ? "An invitation for this phone number already exists."
                : "Failed to create invitation. Please try again.";
              showErrorToast(errorMessage);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ThemedView className="flex-1">
        <StatusBar barStyle="default" animated />
        <View
          className="pb-2 mx-3"
          style={{
            paddingTop: insets.top + 6,
          }}
        >
          <ThemedHeaderWithBack
            onBackPress={() => {
              router.back();
            }}
            title="Confirm Owner Details"
          />
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-2 flex-col space-y-6">
            {/* Residence Info */}
            <View
              className="rounded-xl p-4"
              style={{ backgroundColor: themedColors.cardBackground }}
            >
              <ThemedTextSecondary className="font-uber-move-medium text-xs uppercase tracking-wider mb-1">
                Residence
              </ThemedTextSecondary>
              <ThemedText className="font-uber-move-medium text-lg">
                {params.residenceName}
              </ThemedText>
              <ThemedTextSecondary className="font-uber-move-regular text-sm mt-1">
                Block {params.block} • Floor {params.floorNumber}
              </ThemedTextSecondary>
            </View>

            {/* Role Banner */}
            <View
              className="rounded-xl p-4 flex-row items-center"
              style={{ backgroundColor: basicColors.gold + "15" }}
            >
              <View
                className="w-10 h-10 items-center justify-center rounded-full mr-3"
                style={{ backgroundColor: basicColors.gold + "25" }}
              >
                <KeyIcon width={18} height={18} color={basicColors.gold} />
              </View>
              <View>
                <ThemedText className="font-uber-move-medium text-base">
                  Owner
                </ThemedText>
                <ThemedTextSecondary className="font-lato-regular text-sm">
                  Primary owner with full access
                </ThemedTextSecondary>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="flex-1">
                <ThemedText className="font-uber-move-medium tracking-wider mb-2 ml-1">
                  Full name
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
                  placeholder="Enter full name"
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
          </View>
        </ScrollView>

        <View
          className="px-5 pb-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <TouchableOpacity
            disabled={!isValid}
            onPress={handleSendInvite}
            className="rounded-lg py-4 items-center justify-center"
            style={{
              backgroundColor: isValid
                ? themedColors.buttonBackground
                : themedColors.disabled,
            }}
          >
            <Text
              className="font-uber-move-medium text-base tracking-wide"
              style={{ color: themedColors.buttonText }}
            >
              Create Invite
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

export default OwnerDetailsScreen;
