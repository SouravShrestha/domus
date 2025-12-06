import React, { useState, useEffect, useCallback } from "react";
import {
    StatusBar,
    View,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    ThemedText,
    ThemedTextSecondary,
    ThemedView,
} from "@themes/themedComponents";
import { router } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { useResidence } from "@/contexts/residenceContext";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { GuestInvitationWithDetails, GuestInvitationStatus } from "@/types/models/visitor";
import {
    getResidenceGuestInvitations,
    cancelGuestInvitation,
    deleteGuestInvitation,
} from "@/api/services/visitor.service";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { format, isPast, isFuture } from "date-fns";
import { CancelIcon, TrashXmarkIcon } from "@/components/icons";

const STATUS_COLORS: Record<GuestInvitationStatus, { bg: string; text: string }> = {
    active: { bg: "#10b98120", text: "#10b981" },
    used: { bg: "#6b728020", text: "#6b7280" },
    expired: { bg: "#ef444420", text: "#ef4444" },
    cancelled: { bg: "#f9731620", text: "#f97316" },
};

const ManageGuestsScreen: React.FC = () => {
    const { themedColors } = useTheme();
    const { currentResidence } = useResidence();
    const insets = useSafeAreaInsets();

    const [invitations, setInvitations] = useState<GuestInvitationWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filter, setFilter] = useState<GuestInvitationStatus | "all">("all");

    const fetchInvitations = useCallback(async () => {
        if (!currentResidence) return;

        try {
            const statusFilter = filter === "all" ? null : filter;
            const { data, error } = await getResidenceGuestInvitations(
                currentResidence.id,
                statusFilter
            );

            if (error) throw error;
            setInvitations(data || []);
        } catch (error: any) {
            showErrorToast(error?.message || "Failed to fetch invitations");
        }
    }, [currentResidence, filter]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchInvitations();
            setIsLoading(false);
        };
        loadData();
    }, [fetchInvitations]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchInvitations();
        setIsRefreshing(false);
    };

    const handleCancel = async (invitation: GuestInvitationWithDetails) => {
        try {
            const { error } = await cancelGuestInvitation(invitation.id);
            if (error) throw error;
            showSuccessToast("Invitation cancelled");
            await fetchInvitations();
        } catch (error: any) {
            showErrorToast(error?.message || "Failed to cancel invitation");
        }
    };

    const handleDelete = async (invitation: GuestInvitationWithDetails) => {
        try {
            const { error } = await deleteGuestInvitation(invitation.id);
            if (error) throw error;
            showSuccessToast("Invitation deleted");
            await fetchInvitations();
        } catch (error: any) {
            showErrorToast(error?.message || "Failed to delete invitation");
        }
    };

    const getStatusLabel = (invitation: GuestInvitationWithDetails): GuestInvitationStatus => {
        if (invitation.status === "active" && isPast(new Date(invitation.valid_until))) {
            return "expired";
        }
        return invitation.status;
    };

    const renderInvitationCard = ({ item }: { item: GuestInvitationWithDetails }) => {
        const status = getStatusLabel(item);
        const statusColor = STATUS_COLORS[status];
        const isActive = status === "active";
        const validFrom = new Date(item.valid_from);
        const validUntil = new Date(item.valid_until);
        const isUpcoming = isFuture(validFrom);

        return (
            <View
                className="rounded-xl p-4 mb-3 border"
                style={{
                    backgroundColor: themedColors.cardBackground,
                    borderColor: themedColors.border,
                }}
            >
                <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                        <View className="flex-row items-center">
                            <ThemedText className="text-base font-uber-move-bold tracking-wide">
                                {item.visitor_name}
                            </ThemedText>
                            <View
                                className="ml-2 px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: statusColor.bg }}
                            >
                                <ThemedText
                                    className="text-xs font-uber-move-medium uppercase"
                                    style={{ color: statusColor.text }}
                                >
                                    {status}
                                </ThemedText>
                            </View>
                        </View>
                        <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide mt-1">
                            {formatPhoneForDisplay(item.visitor_phone)}
                        </ThemedTextSecondary>
                    </View>

                    {isActive && (
                        <View className="flex-row" style={{ gap: 8 }}>
                            <TouchableOpacity
                                onPress={() => handleCancel(item)}
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: themedColors.border }}
                            >
                                <CancelIcon width={18} height={18} color={themedColors.error} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {status !== "active" && (
                        <TouchableOpacity
                            onPress={() => handleDelete(item)}
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: themedColors.border }}
                        >
                            <TrashXmarkIcon width={18} height={18} color={themedColors.error} />
                        </TouchableOpacity>
                    )}
                </View>

                <View
                    className="mt-3 pt-3 border-t"
                    style={{ borderColor: themedColors.border }}
                >
                    <View className="flex-row justify-between">
                        <View>
                            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider">
                                Visits
                            </ThemedTextSecondary>
                            <ThemedText className="text-sm font-uber-move-medium mt-0.5">
                                {item.visits_used} / {item.visits_allowed}
                            </ThemedText>
                        </View>
                        <View>
                            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider">
                                Pass Code
                            </ThemedTextSecondary>
                            <ThemedText className="text-sm font-uber-move-medium mt-0.5">
                                {item.pass_code}
                            </ThemedText>
                        </View>
                    </View>

                    <View className="mt-3">
                        <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider">
                            {isUpcoming ? "Starts" : "Valid"}
                        </ThemedTextSecondary>
                        <ThemedText className="text-sm font-uber-move-medium mt-0.5">
                            {format(validFrom, "dd MMM, hh:mm a")} — {format(validUntil, "dd MMM, hh:mm a")}
                        </ThemedText>
                    </View>

                    {item.purpose && (
                        <View className="mt-3">
                            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider">
                                Purpose
                            </ThemedTextSecondary>
                            <ThemedText className="text-sm font-uber-move-medium mt-0.5">
                                {item.purpose}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const FilterButton = ({
        label,
        value,
    }: {
        label: string;
        value: GuestInvitationStatus | "all";
    }) => (
        <TouchableOpacity
            onPress={() => setFilter(value)}
            className="px-4 py-2 rounded-lg mr-2"
            style={{
                backgroundColor:
                    filter === value ? themedColors.accent + "20" : themedColors.cardBackground,
                borderWidth: 1,
                borderColor: filter === value ? themedColors.accent : themedColors.border,
            }}
        >
            <ThemedText
                className="text-sm font-uber-move-medium"
                style={{ color: filter === value ? themedColors.accent : themedColors.text }}
            >
                {label}
            </ThemedText>
        </TouchableOpacity>
    );

    return (
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
                    title="Guest Invitations"
                />
            </View>

            <View className="px-5 py-3">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[
                        { label: "All", value: "all" as const },
                        { label: "Active", value: "active" as const },
                        { label: "Used", value: "used" as const },
                        { label: "Expired", value: "expired" as const },
                        { label: "Cancelled", value: "cancelled" as const },
                    ]}
                    renderItem={({ item }) => (
                        <FilterButton label={item.label} value={item.value} />
                    )}
                    keyExtractor={(item) => item.value}
                />
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={themedColors.accent} />
                </View>
            ) : invitations.length === 0 ? (
                <View className="flex-1 items-center justify-center px-5">
                    <ThemedText className="text-lg font-uber-move-medium tracking-wide text-center">
                        No invitations found
                    </ThemedText>
                    <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide text-center mt-2">
                        Create a new guest invitation to get started
                    </ThemedTextSecondary>
                </View>
            ) : (
                <FlatList
                    data={invitations}
                    renderItem={renderInvitationCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingBottom: insets.bottom + 20,
                    }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={themedColors.accent}
                        />
                    }
                />
            )}
        </ThemedView>
    );
};

export default ManageGuestsScreen;
