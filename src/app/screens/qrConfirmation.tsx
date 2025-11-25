import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CancelIcon, HeartIcon } from "@components/icons";
import {
    fetchResidenceWithSociety,
    searchInviteCode,
    requestResidenceMembership,
    acceptResidenceInvitation
} from "@api/residence.service";
import { useAuth } from "@contexts/authContext";
import { ResidenceWithSociety } from "@/types/api/response/residence";
import { InviteResponse, isResidenceInvite, isVisitorInvite } from "@/types/api/response/invite";
import { useTheme } from "@contexts/themeContext";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import colorMapping from "@themes/colors";
import { capitalizeFirstLetterOfWords } from "@utils/textHelpers";
import LoadingOverlay from "@components/widgets/LoadingOverlay";

export default function QRConfirmationScreen() {
    const params = useLocalSearchParams<{
        type: "public" | "invite";
        residenceId?: string;
        inviteCode?: string
    }>();
    const router = useRouter();
    const { profile } = useAuth();
    const { themedColors, currentTheme } = useTheme();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [residenceData, setResidenceData] = useState<ResidenceWithSociety | null>(null);
    const [inviteData, setInviteData] = useState<InviteResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (params.type === "public" && params.residenceId) {
                const { data, error } = await fetchResidenceWithSociety(params.residenceId);
                if (error) throw error;
                if (!data) throw new Error("Residence not found");
                setResidenceData(data);
            } else if (params.type === "invite" && params.inviteCode) {
                if (!profile?.phone) {
                    throw new Error("User phone number not found. Please update your profile.");
                }
                const { data, error } = await searchInviteCode(params.inviteCode.trim(), profile.phone);
                if (error) throw error;
                if (!data) throw new Error("Invite not found");
                setInviteData(data);
            } else {
                throw new Error("Invalid parameters");
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load details";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [params.type, params.residenceId, params.inviteCode, profile?.phone]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleConfirm = async () => {
        if (!profile) return;
        setSubmitting(true);
        try {
            if (params.type === "public" && params.residenceId) {
                const { error } = await requestResidenceMembership(params.residenceId, profile.id);
                if (error) throw error;
                Alert.alert("Success", "Request sent successfully!", [
                    { text: "OK", onPress: () => router.replace("/screens/membershipStatusScreen") }
                ]);
            } else if (params.type === "invite" && inviteData) {
                if (!profile.phone) throw new Error("User phone required");
                const { error } = await acceptResidenceInvitation(inviteData.id, profile.id, profile.phone);
                if (error) throw error;
                Alert.alert("Success", "You have joined the residence!", [
                    { text: "OK", onPress: () => router.replace("/(tabs)/home") }
                ]);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to process request";
            Alert.alert("Error", errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const formatInviteTypeOnly = (invite: InviteResponse): string => {
        if (isResidenceInvite(invite)) {
            return "Resident";
        } else if (isVisitorInvite(invite)) {
            return "Visitor";
        }
        return "Invite";
    };

    const formatDateTime = (dateTime: string): string => {
        const date = new Date(dateTime);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatExpiryDate = (expiresAt: string): string => {
        const date = new Date(expiresAt);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <LoadingOverlay currentTheme={currentTheme} withToast={false} />
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1" style={{ backgroundColor: themedColors.background }}>
                <View className="p-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <CancelIcon width={24} height={24} color={themedColors.text} />
                    </TouchableOpacity>
                </View>
                <View className="flex-1 justify-center items-center p-5">
                    <HeartIcon width={48} height={48} color="red" />
                    <ThemedText className="mt-3 mb-5 text-red-500 text-center">{error}</ThemedText>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="px-6 py-3 rounded-lg"
                        style={{ backgroundColor: themedColors.buttonBackground }}
                    >
                        <ThemedText style={{ color: themedColors.buttonText }}>Go Back</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const renderInviteDetails = (invite: InviteResponse) => (
        <>
            <View className="px-6 pt-6">
                <ThemedText className="text-2xl font-uber-move-medium tracking-wide mb-1">
                    {invite.residenceShortName}
                </ThemedText>
                <ThemedText className="text-xl font-uber-move-medium tracking-wide mb-3">
                    {invite.societyName}
                </ThemedText>
                <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide leading5">
                    {isResidenceInvite(invite)
                        ? `You have been invited to join ${invite.residenceShortName} as a ${formatInviteTypeOnly(invite)}. \nPlease verify the invitation to continue.`
                        : `You have been invited to visit ${invite.residenceShortName} as a ${formatInviteTypeOnly(invite)}. \nPlease verify the invitation to continue.`}
                </ThemedTextSecondary>
            </View>

            <View className="px-6 pt-6">
                <View
                    className="rounded-lg overflow-hidden"
                    style={{
                        backgroundColor: themedColors.cardBackground,
                        borderWidth: 1,
                        borderColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                    }}
                >
                    <View
                        className="flex-row items-center justify-between py-3 px-4"
                        style={{
                            borderBottomWidth: 1,
                            borderColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                        }}
                    >
                        <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                            Invited By
                        </ThemedTextSecondary>
                        <ThemedText className="text-base font-lato-regular flex-1 text-right">
                            {invite.invitedByUserName}
                        </ThemedText>
                    </View>

                    <View
                        className="flex-row items-center justify-between py-3 px-4"
                        style={{
                            borderBottomWidth: 1,
                            borderBottomColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                        }}
                    >
                        <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                            Type
                        </ThemedTextSecondary>
                        <ThemedText className="text-base font-lato-regular flex-1 text-right">
                            {formatInviteTypeOnly(invite)}
                        </ThemedText>
                    </View>

                    {isResidenceInvite(invite) && invite.residentRole && (
                        <View
                            className="flex-row items-center justify-between py-3 px-4"
                            style={{
                                borderBottomWidth: 1,
                                borderBottomColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                            }}
                        >
                            <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                                Role
                            </ThemedTextSecondary>
                            <ThemedText className="text-base font-lato-regular flex-1 text-right">
                                {capitalizeFirstLetterOfWords(invite.residentRole)}
                            </ThemedText>
                        </View>
                    )}

                    {isVisitorInvite(invite) && (
                        <>
                            <View
                                className="flex-row items-center justify-between py-3 px-4"
                                style={{
                                    borderBottomWidth: 1,
                                    borderBottomColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                                }}
                            >
                                <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                                    Expected Check-In
                                </ThemedTextSecondary>
                                <ThemedText className="text-base font-lato-regular flex-1 text-right">
                                    {formatDateTime(invite.expectedCheckInTime)}
                                </ThemedText>
                            </View>
                            <View
                                className="flex-row items-center justify-between py-3 px-4"
                                style={{
                                    borderBottomWidth: 1,
                                    borderBottomColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                                }}
                            >
                                <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                                    Expected Check-Out
                                </ThemedTextSecondary>
                                <ThemedText className="text-base font-lato-regular flex-1 text-right">
                                    {formatDateTime(invite.expectedCheckOutTime)}
                                </ThemedText>
                            </View>
                            {invite.visitPurpose && (
                                <View
                                    className="flex-row items-center justify-between py-3 px-4"
                                    style={{
                                        borderBottomWidth: 1,
                                        borderBottomColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                                    }}
                                >
                                    <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                                        Visit Purpose
                                    </ThemedTextSecondary>
                                    <ThemedText className="text-base font-lato-regular flex-1 text-right">
                                        {invite.visitPurpose}
                                    </ThemedText>
                                </View>
                            )}
                        </>
                    )}

                    <View
                        className="flex-row items-center justify-between py-3 px-4"
                        style={{
                            borderBottomWidth: isResidenceInvite(invite) ? 1 : 0,
                            borderBottomColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                        }}
                    >
                        <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                            Invite Code
                        </ThemedTextSecondary>
                        <ThemedText
                            className="text-base font-lato-medium flex-1 text-right"
                            style={{ color: themedColors.accent }}
                        >
                            {invite.code}
                        </ThemedText>
                    </View>

                    {isResidenceInvite(invite) && (
                        <View className="flex-row items-center justify-between py-3 px-4">
                            <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                                Expires On
                            </ThemedTextSecondary>
                            <ThemedText className="text-base font-lato-regular flex-1 text-right">
                                {formatExpiryDate(invite.expiresAt)}
                            </ThemedText>
                        </View>
                    )}
                </View>

                {invite.used && (
                    <View
                        className="mt-4 px-4 py-3 rounded-lg items-center"
                        style={{
                            backgroundColor: colorMapping.green + "20",
                            borderWidth: 1,
                            borderColor: colorMapping.green + "50",
                        }}
                    >
                        <ThemedText
                            className="text-sm font-lato-medium"
                            style={{ color: colorMapping.green }}
                        >
                            This invitation has already been used
                        </ThemedText>
                    </View>
                )}
            </View>
        </>
    );

    const renderPublicDetails = (residence: ResidenceWithSociety) => (
        <>
            <View className="px-6 pt-6">
                <ThemedText className="text-2xl font-uber-move-medium tracking-wide mb-1">
                    {residence.block ? `${residence.block} - ` : ""}{residence.flat_number}
                </ThemedText>
                <ThemedText className="text-xl font-uber-move-medium tracking-wide mb-3">
                    {residence.society?.name}
                </ThemedText>
                <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide leading5">
                    You are requesting to join this residence. The admin will need to approve your request.
                </ThemedTextSecondary>
            </View>

            <View className="px-6 pt-6">
                <View
                    className="rounded-lg overflow-hidden"
                    style={{
                        backgroundColor: themedColors.cardBackground,
                        borderWidth: 1,
                        borderColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                    }}
                >
                    <View
                        className="flex-row items-center justify-between py-3 px-4"
                        style={{
                            borderBottomWidth: 1,
                            borderColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                        }}
                    >
                        <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                            City
                        </ThemedTextSecondary>
                        <ThemedText className="text-base font-lato-regular flex-1 text-right">
                            {residence.society?.address?.city}
                        </ThemedText>
                    </View>

                    <View
                        className="flex-row items-center justify-between py-3 px-4"
                        style={{
                            borderBottomWidth: 1,
                            borderBottomColor: currentTheme === "dark" ? themedColors.border + "30" : themedColors.border,
                        }}
                    >
                        <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                            Street
                        </ThemedTextSecondary>
                        <ThemedText className="text-base font-lato-regular flex-1 text-right">
                            {residence.society?.address?.street}
                        </ThemedText>
                    </View>

                    <View className="flex-row items-center justify-between py-3 px-4">
                        <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
                            Type
                        </ThemedTextSecondary>
                        <ThemedText className="text-base font-lato-regular flex-1 text-right">
                            Residence
                        </ThemedText>
                    </View>
                </View>
            </View>
        </>
    );

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: themedColors.background }}>
            <View className="p-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <CancelIcon width={24} height={24} color={themedColors.text} />
                </TouchableOpacity>
            </View>
            <ScrollView>
                {params.type === "invite" && inviteData && renderInviteDetails(inviteData)}
                {params.type === "public" && residenceData && renderPublicDetails(residenceData)}
            </ScrollView>

            {/* Action Buttons */}
            {((inviteData && !inviteData.used) || residenceData) && (
                <View
                    className="px-6 pt-6 pb-6"
                    style={{ gap: 12, paddingBottom: insets.bottom + 24 }}
                >
                    <TouchableOpacity
                        onPress={handleConfirm}
                        disabled={submitting}
                        className="p-4 rounded-lg items-center"
                        style={{
                            backgroundColor: themedColors.buttonBackground,
                            opacity: submitting ? 0.6 : 1,
                        }}
                    >
                        <View className="flex-row items-center justify-center">
                            {submitting && <ActivityIndicator size="small" color={themedColors.buttonText} className="mr-2" />}
                            <ThemedText
                                className="text-base font-uber-move-medium tracking-wider"
                                style={{ color: themedColors.buttonText }}
                            >
                                {params.type === "public"
                                    ? "Request to Join"
                                    : (isResidenceInvite(inviteData!) ? "Join residence" : "Accept invitation")}
                            </ThemedText>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        disabled={submitting}
                        className="p-2 rounded-lg items-center"
                        style={{
                            opacity: submitting ? 0.6 : 1,
                        }}
                    >
                        <ThemedText
                            className="text-sm font-uber-move-medium tracking-wider border-b px-1 pb-0.5"
                            style={{
                                borderBottomWidth: 1,
                                borderBottomColor: themedColors.text,
                            }}
                        >
                            Decline
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
