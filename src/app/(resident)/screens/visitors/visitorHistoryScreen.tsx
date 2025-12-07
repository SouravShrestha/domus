import React, { useState, useEffect, useCallback } from "react";
import {
    StatusBar,
    View,
    FlatList,
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
import { GuestLogWithInvitation } from "@/types/models/visitor";
import { getGuestHistory } from "@/api/services/visitor.service";
import { showErrorToast } from "@/utils/toast";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { format, formatDistanceToNow } from "date-fns";
import { CheckCircleIcon, ClockFiveIcon } from "@/components/icons";

const GuestHistoryScreen: React.FC = () => {
    const { themedColors } = useTheme();
    const { currentResidence } = useResidence();
    const insets = useSafeAreaInsets();

    const [logs, setLogs] = useState<GuestLogWithInvitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!currentResidence) return;

        try {
            const { data, error } = await getGuestHistory(currentResidence.id);
            if (error) throw error;
            setLogs(data || []);
        } catch (error: any) {
            showErrorToast(error?.message || "Failed to fetch guest history");
        }
    }, [currentResidence]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchHistory();
            setIsLoading(false);
        };
        loadData();
    }, [fetchHistory]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchHistory();
        setIsRefreshing(false);
    };

    const renderLogCard = ({ item }: { item: GuestLogWithInvitation }) => {
        const invitation = item.guest_invitation;
        const entryTime = new Date(item.entry_time);
        const exitTime = item.exit_time ? new Date(item.exit_time) : null;
        const isStillInside = !exitTime;

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
                                {invitation.visitor_name}
                            </ThemedText>
                            {isStillInside && (
                                <View
                                    className="ml-2 px-2 py-0.5 rounded-full flex-row items-center"
                                    style={{ backgroundColor: "#10b98120" }}
                                >
                                    <View
                                        className="w-1.5 h-1.5 rounded-full mr-1"
                                        style={{ backgroundColor: "#10b981" }}
                                    />
                                    <ThemedText
                                        className="text-xs font-uber-move-medium"
                                        style={{ color: "#10b981" }}
                                    >
                                        Inside
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                        <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide mt-1">
                            {formatPhoneForDisplay(invitation.visitor_phone)}
                        </ThemedTextSecondary>
                    </View>

                    <View className="items-end">
                        <ThemedTextSecondary className="text-xs font-lato-regular">
                            {formatDistanceToNow(entryTime, { addSuffix: true })}
                        </ThemedTextSecondary>
                    </View>
                </View>

                <View
                    className="mt-3 pt-3 border-t"
                    style={{ borderColor: themedColors.border }}
                >
                    <View className="flex-row justify-between">
                        <View>
                            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider">
                                Entry Method
                            </ThemedTextSecondary>
                            <ThemedText className="text-sm font-uber-move-medium mt-0.5 capitalize">
                                {item.entry_method.replace(/_/g, " ")}
                            </ThemedText>
                        </View>
                        <View>
                            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider">
                                Pass Code
                            </ThemedTextSecondary>
                            <ThemedText className="text-sm font-uber-move-medium mt-0.5">
                                {invitation.pass_code}
                            </ThemedText>
                        </View>
                    </View>

                    <View className="mt-4 flex-row">
                        <View className="flex-1">
                            <View className="flex-row items-center">
                                <CheckCircleIcon
                                    width={14}
                                    height={14}
                                    color={themedColors.success}
                                />
                                <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider ml-1">
                                    Entry
                                </ThemedTextSecondary>
                            </View>
                            <ThemedText className="text-sm font-uber-move-medium mt-1">
                                {format(entryTime, "dd MMM, hh:mm a")}
                            </ThemedText>
                            {item.entry_gate && (
                                <ThemedTextSecondary className="text-xs font-lato-regular mt-0.5">
                                    Gate: {item.entry_gate}
                                </ThemedTextSecondary>
                            )}
                        </View>

                        <View className="flex-1">
                            <View className="flex-row items-center">
                                {exitTime ? (
                                    <CheckCircleIcon
                                        width={14}
                                        height={14}
                                        color={themedColors.error}
                                    />
                                ) : (
                                    <ClockFiveIcon
                                        width={14}
                                        height={14}
                                        color={themedColors.secondaryText}
                                    />
                                )}
                                <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-wider ml-1">
                                    Exit
                                </ThemedTextSecondary>
                            </View>
                            <ThemedText className="text-sm font-uber-move-medium mt-1">
                                {exitTime
                                    ? format(exitTime, "dd MMM, hh:mm a")
                                    : "Still inside"}
                            </ThemedText>
                            {item.exit_gate && (
                                <ThemedTextSecondary className="text-xs font-lato-regular mt-0.5">
                                    Gate: {item.exit_gate}
                                </ThemedTextSecondary>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

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
                    title="guest history"
                />
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={themedColors.accent} />
                </View>
            ) : logs.length === 0 ? (
                <View className="flex-1 items-center justify-center px-5">
                    <ThemedText className="text-lg font-uber-move-medium tracking-wide text-center">
                        No guest history
                    </ThemedText>
                    <ThemedTextSecondary className="text-sm font-lato-regular tracking-wide text-center mt-2">
                        Guest entry/exit records will appear here
                    </ThemedTextSecondary>
                </View>
            ) : (
                <FlatList
                    data={logs}
                    renderItem={renderLogCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 16,
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

export default GuestHistoryScreen;
