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
import { useResidence } from "@contexts/residenceContext";
import { useAuth } from "@contexts/authContext";
import { router, useLocalSearchParams } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import {
  capitalizeFirstLetterOfWords,
  cleanFullName,
} from "@utils/textHelpers";
import { EmployeeManAltIcon, HoldingHandKeyIcon, SmilingBoyIcon } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { createResidenceInvite } from "@api/services/invitation.service";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import basicColors from "@/themes/colors";

type FamilyRole = "owner" | "adult" | "kid";

const FamilyMemberDetailsScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const { currentResidence } = useResidence();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    phone: string;
    name?: string;
  }>();

  const [name, setName] = useState<string>(
    capitalizeFirstLetterOfWords(cleanFullName(params.name || ""))
  );
  const [selectedRole, setSelectedRole] = useState<FamilyRole>("adult");
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

    const roleLabel = roleOptions.find((r) => r.value === selectedRole)?.label;

    Alert.alert(
      "Confirm Invitation",
      `Create invitation for ${capitalizedName} as ${roleLabel}?`,
      [
        {
          text: "Cancel",
          style: "destructive",
        },
        {
          text: "Invite",
          onPress: async () => {
            if (!currentResidence?.id || !user?.id) {
              showErrorToast("Unable to create invitation. Please try again.");
              return;
            }

            setIsLoading(true);
            try {
              const { data, error } = await createResidenceInvite(
                params.phone,
                currentResidence.id,
                selectedRole,
                user.id,
                true,
                capitalizedName,
                currentResidence.short_name,
                currentResidence.society?.name
              );

              if (error || !data) {
                throw error || new Error("Failed to create invitation");
              }

              showSuccessToast("Invitation created successfully");
              router.dismissTo(ROUTES.SCREENS.PEOPLE.MANAGE_FAMILY);
              router.push({
                pathname: ROUTES.SCREENS.PEOPLE.INVITE_SENT_SUCCESS,
                params: {
                  name: capitalizedName,
                  phone: params.phone,
                  role: roleLabel,
                  inviteCode: data.invite_code,
                },
              });
            } catch (error: any) {
              console.error("Error creating invitation:", error);
              const errorMessage = error?.message?.includes("already exists")
                ? "An invitation for this phone number already exists."
                : "Failed to create invitation. Please try again.";
              showErrorToast(errorMessage);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const ICON_SIZE = 16;
  const roleOptions: {
    value: FamilyRole;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      value: "owner",
      label: "Owner",
      description: "Primary owner with full access",
      color: basicColors.gold,
      icon: <HoldingHandKeyIcon color={basicColors.gold} width={ICON_SIZE} height={ICON_SIZE}/>
    },
    {
      value: "adult",
      label: "Adult",
      description: "Family member with full resident rights",
      color: basicColors.blue,
      icon: <EmployeeManAltIcon color={basicColors.blue} width={ICON_SIZE} height={ICON_SIZE}/>
    },
    {
      value: "kid",
      label: "Kid",
      description: "Minor with limited access",
      color: basicColors.lightPink,
      icon: <SmilingBoyIcon color={basicColors.lightPink} width={ICON_SIZE} height={ICON_SIZE}/>
    },
  ];

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
            onBackPress={() => {
              router.back();
            }}
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

            <View>
              <ThemedText className="font-uber-move-medium mb-3 ml-1 tracking-wider">
                What role will they have?
              </ThemedText>
              <View className="flex-row space-x-3">
                {roleOptions.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    onPress={() => setSelectedRole(role.value)}
                    className="flex-1 rounded-md py-3 items-center justify-center border"
                    style={{
                      borderColor:
                        selectedRole === role.value
                          ? themedColors.accent
                          : themedColors.border,
                      borderWidth: selectedRole === role.value ? 2 : 1,
                      backgroundColor:
                        selectedRole === role.value
                          ? themedColors.accent + "10"
                          : themedColors.cardBackground,
                    }}
                  >
                    <View className="items-center space-y-3">
                      {role.icon && (
                        <View
                          className="w-12 h-12 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: role.color + "20",
                          }}
                        >
                          {role.icon}
                        </View>
                      )}
                      <ThemedText className="font-uber-move-medium text-base">
                        {role.label}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <ThemedTextSecondary className="font-lato-regular text-sm mt-5 ml-1">
                {roleOptions.find((r) => r.value === selectedRole)?.description}
              </ThemedTextSecondary>
              <ThemedTextSecondary className="font-lato-regular text-sm mt-2 ml-1">
                Roles and permissions can be updated later
              </ThemedTextSecondary>
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

export default FamilyMemberDetailsScreen;
