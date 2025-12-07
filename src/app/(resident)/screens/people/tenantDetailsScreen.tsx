import React, { useState } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    StatusBar,
    ScrollView,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, ThemedView } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { router, useLocalSearchParams } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { sanitizeName } from "@utils/textHelpers";
import basicColors from "@themes/colors";
import { ROUTES } from "@constants/routes";

type TenantType = "primary" | "family";

const TenantDetailsScreen: React.FC = () => {
    const { themedColors } = useTheme();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{
        phone: string;
        name?: string;
    }>();

    const [name, setName] = useState<string>(params.name || "");
    const [selectedType, setSelectedType] = useState<TenantType | null>(null);
    const [error, setError] = useState<string>("");
    const [isInvalidName, setIsInvalidName] = useState<boolean>(false);
    const [inviteSent, setInviteSent] = useState<boolean>(false);

    const isValid = name.length > 2 && selectedType !== null && !isInvalidName;

    const handleNameChange = (text: string) => {
        const sanitized = sanitizeName(text);

        if (/[^a-zA-Z ]/.test(sanitized)) {
            setError("Name can only contain letters and spaces");
            setIsInvalidName(true);
        } else {
            setIsInvalidName(false);
            setError("");
        }

        setName(sanitized);
    };

    const handleSendInvite = () => {
        Keyboard.dismiss();

        if (!isValid) {
            return;
        }

        const typeLabel = selectedType === "primary" ? "Primary Tenant" : "Tenant Family";

        Alert.alert(
            "Confirm Invitation",
            `Send invitation to ${name} as ${typeLabel}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Send Invite",
                    onPress: () => {
                        setInviteSent(true);
                    },
                },
            ]
        );
    };

    const typeOptions: { value: TenantType; label: string; description: string }[] = [
        {
            value: "primary",
            label: "Primary Tenant",
            description: "Main tenant with full access to the unit",
        },
        {
            value: "family",
            label: "Tenant Family",
            description: "Family member of the tenant",
        },
    ];

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ThemedView className="flex-1">
                <StatusBar barStyle="default" animated />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                    className="flex-1"
                >
                    <View
                        className="pb-2 mx-3"
                        style={{
                            paddingTop: insets.top + 16,
                        }}
                    >
                        <ThemedHeaderWithBack
                            onBackPress={() => {
                                if (inviteSent) {
                                    router.dismissTo(ROUTES.SCREENS.PEOPLE.MANAGE_TENANTS);
                                } else {
                                    router.back();
                                }
                            }}
                            title="Tenant Details"
                        />
                    </View>

                    {inviteSent ? (
                        <View className="flex-1 justify-center items-center px-5">
                            <View
                                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                                style={{ backgroundColor: themedColors.accent + "20" }}
                            >
                                <ThemedText className="text-3xl">✓</ThemedText>
                            </View>
                            <ThemedText className="font-uber-move-medium text-xl mb-2 text-center">
                                Invitation Sent!
                            </ThemedText>
                            <ThemedText className="font-lato-regular text-base text-center opacity-70 mb-6">
                                {name} will receive an invite link to join as {selectedType === "primary" ? "Primary Tenant" : "Tenant Family"}
                            </ThemedText>
                            <TouchableOpacity
                                onPress={() => router.dismissTo(ROUTES.SCREENS.PEOPLE.MANAGE_TENANTS)}
                                className="rounded-lg px-8 py-3"
                                style={{ backgroundColor: themedColors.accent }}
                            >
                                <ThemedText
                                    className="font-uber-move-medium text-base"
                                    style={{ color: themedColors.textOnAccent }}
                                >
                                    Done
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <ScrollView
                                className="flex-1 px-5"
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View className="mt-6 flex-col space-y-6">
                                    <View className="flex-row items-center">
                                        <View className="flex-1">
                                            <ThemedText className="font-lato-regular mb-2 ml-1">
                                                Full Name *
                                            </ThemedText>
                                            <TextInput
                                                className="rounded-md px-4 border font-lato-regular"
                                                style={{
                                                    height: 48,
                                                    fontSize: 16,
                                                    color: themedColors.text,
                                                    borderColor: isInvalidName
                                                        ? basicColors.error
                                                        : themedColors.border,
                                                }}
                                                keyboardType="default"
                                                autoFocus={!params.name}
                                                placeholder="Enter full name"
                                                placeholderTextColor={themedColors.placeholderText}
                                                value={name}
                                                onChangeText={handleNameChange}
                                                maxLength={30}
                                            />
                                        </View>
                                    </View>

                                    <View className="flex-row items-center">
                                        <View className="flex-1">
                                            <ThemedText className="font-lato-regular mb-2 ml-1">
                                                Phone Number
                                            </ThemedText>
                                            <View
                                                className="rounded-md px-4 border font-lato-regular justify-center"
                                                style={{
                                                    height: 48,
                                                    borderColor: themedColors.border,
                                                    backgroundColor: themedColors.disabled + "30",
                                                }}
                                            >
                                                <ThemedText
                                                    className="font-lato-regular opacity-70"
                                                    style={{ fontSize: 16 }}
                                                >
                                                    {params.phone}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </View>

                                    <View>
                                        <ThemedText className="font-lato-regular mb-3 ml-1">
                                            Tenant Type *
                                        </ThemedText>
                                        <View className="space-y-3">
                                            {typeOptions.map((type) => (
                                                <TouchableOpacity
                                                    key={type.value}
                                                    onPress={() => setSelectedType(type.value)}
                                                    className="rounded-lg p-4 border"
                                                    style={{
                                                        borderColor:
                                                            selectedType === type.value
                                                                ? themedColors.accent
                                                                : themedColors.border,
                                                        borderWidth: selectedType === type.value ? 2 : 1,
                                                        backgroundColor:
                                                            selectedType === type.value
                                                                ? themedColors.accent + "10"
                                                                : themedColors.cardBackground,
                                                    }}
                                                >
                                                    <View className="flex-row items-center justify-between">
                                                        <View className="flex-1">
                                                            <ThemedText className="font-uber-move-medium text-base mb-1">
                                                                {type.label}
                                                            </ThemedText>
                                                            <ThemedText className="font-lato-regular text-sm opacity-70">
                                                                {type.description}
                                                            </ThemedText>
                                                        </View>
                                                        {selectedType === type.value && (
                                                            <View
                                                                className="w-6 h-6 rounded-full items-center justify-center"
                                                                style={{
                                                                    backgroundColor: themedColors.accent,
                                                                }}
                                                            >
                                                                <ThemedText
                                                                    className="text-sm"
                                                                    style={{
                                                                        color: themedColors.textOnAccent,
                                                                    }}
                                                                >
                                                                    ✓
                                                                </ThemedText>
                                                            </View>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {error ? (
                                        <View className="mt-2">
                                            <ThemedText
                                                className="font-medium text-sm font-lato-regular"
                                                style={{ color: basicColors.error }}
                                            >
                                                {error}
                                            </ThemedText>
                                        </View>
                                    ) : null}
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
                                            ? themedColors.accent
                                            : themedColors.disabled,
                                    }}
                                >
                                    <ThemedText
                                        className="font-uber-move-medium text-base"
                                        style={{ color: themedColors.textOnAccent }}
                                    >
                                        Send Invite
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </KeyboardAvoidingView>
            </ThemedView>
        </TouchableWithoutFeedback>
    );
};

export default TenantDetailsScreen;
