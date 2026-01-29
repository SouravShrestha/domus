import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StatusBar,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
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
import { useResidence } from "@contexts/residenceContext";
import { router, useFocusEffect } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { HourglassEndIcon, PlusIcon, UserShieldIcon } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { appEventEmitter, AppEvents } from "@/utils/eventEmitter";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { ProfileIcon } from "@/components/widgets/ProfileIcon";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import basicColors from "@/themes/colors";
import EmptyStateView from "@/components/widgets/EmptyStateView";
import { Image } from "expo-image";
import emptyViewImage from "@assets/images/girl-empty-box.png";
import {
  getGuardsBySociety,
  getGuardInvitesBySociety,
  deleteGuardInvite,
} from "@api/services/guard.service";
import { GuardInvite, GuardProfile } from "@/types/models/guard";

type GuardWithUser = GuardProfile & {
  user: { id: string; name: string; phone: string; photo_url?: string };
};

const ManageGuardsScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const { user } = useAuth();
  const { currentResidence } = useResidence();
  const insets = useSafeAreaInsets();

  const selectedSocietyId = currentResidence?.society?.id;
  const selectedSocietyName = currentResidence?.society?.name || "Society";

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [guards, setGuards] = useState<GuardWithUser[]>([]);
  const [pendingInvites, setPendingInvites] = useState<GuardInvite[]>([]);
  const [selectedGuard, setSelectedGuard] = useState<GuardWithUser | null>(
    null,
  );
  const [selectedPendingInvite, setSelectedPendingInvite] =
    useState<GuardInvite | null>(null);

  const guardBottomSheetRef = useRef<BottomSheet>(null);
  const pendingBottomSheetRef = useRef<BottomSheet>(null);
  const hasInitiallyLoaded = useRef(false);

  const fetchGuards = useCallback(
    async (showLoadingOverlay = true) => {
      if (!selectedSocietyId) return;

      if (showLoadingOverlay) {
        setIsLoading(true);
      }

      try {
        const [guardsResult, invitesResult] = await Promise.all([
          getGuardsBySociety(selectedSocietyId),
          getGuardInvitesBySociety(selectedSocietyId),
        ]);

        if (!guardsResult.error && guardsResult.data) {
          setGuards(guardsResult.data);
        }

        if (!invitesResult.error && invitesResult.data) {
          setPendingInvites(
            invitesResult.data.filter((inv) => inv.status === "pending"),
          );
        }
      } catch (error) {
        console.error("Error fetching guards:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedSocietyId],
  );

  useEffect(() => {
    const unsubscribe = appEventEmitter.on(AppEvents.GUARD_UPDATED, () =>
      fetchGuards(false),
    );
    return () => {
      unsubscribe();
    };
  }, [fetchGuards]);

  useFocusEffect(
    useCallback(() => {
      if (!hasInitiallyLoaded.current) {
        hasInitiallyLoaded.current = true;
        fetchGuards();
      }
    }, [fetchGuards]),
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchGuards(false);
  }, [fetchGuards]);

  const handleGuardPress = useCallback((guard: GuardWithUser) => {
    setSelectedGuard(guard);
    guardBottomSheetRef.current?.expand();
  }, []);

  const handlePendingInvitePress = useCallback((invite: GuardInvite) => {
    setSelectedPendingInvite(invite);
    pendingBottomSheetRef.current?.expand();
  }, []);

  const handleDiscardInvite = useCallback(async () => {
    if (!selectedPendingInvite) return;

    Alert.alert(
      "Cancel Invitation",
      `Are you sure you want to cancel the invitation for ${selectedPendingInvite.name || "this guard"}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              pendingBottomSheetRef.current?.close();
              await deleteGuardInvite(selectedPendingInvite.id, user?.id || "");
              setSelectedPendingInvite(null);
              appEventEmitter.emit(AppEvents.GUARD_UPDATED);
            } catch (error) {
              console.error("Error deleting invitation:", error);
              Alert.alert(
                "Error",
                "Failed to cancel invitation. Please try again.",
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  }, [selectedPendingInvite, user?.id]);

  const handleInviteGuard = useCallback(() => {
    router.push({
      pathname: ROUTES.MANAGER.SCREENS.SERVICES.INVITE_GUARD,
      params: {
        societyId: selectedSocietyId,
        societyName: selectedSocietyName,
      },
    });
  }, [selectedSocietyId, selectedSocietyName]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    [],
  );

  const renderGuardCard = (guard: GuardWithUser, index: number) => (
    <TouchableOpacity
      key={guard.id}
      onPress={() => handleGuardPress(guard)}
      activeOpacity={0.7}
      className="px-3 py-5 rounded-lg border"
      style={{
        backgroundColor: themedColors.cardBackground,
        width: "48%",
        marginRight: index % 2 === 0 ? "4%" : 0,
        marginBottom: 18,
        borderColor: themedColors.lightBorder,
      }}
    >
      <View className="items-center">
        <View className="relative">
          <ProfileIcon
            username={guard.user.name}
            avatarUrl={guard.user.photo_url}
            size={56}
          />
          <View
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
            style={{ backgroundColor: basicColors.blue }}
          >
            <UserShieldIcon width={10} height={10} color="#fff" />
          </View>
        </View>
        <View className="mt-3 items-center">
          <View className="flex items-center gap-y-0.5">
            <ThemedText
              className="text-base font-uber-move-medium tracking-wide text-center"
              numberOfLines={1}
            >
              {guard.user.name}
            </ThemedText>
            <ThemedTextSecondary
              className="text-sm font-uber-move-medium tracking-wide text-center"
              numberOfLines={1}
            >
              {guard.user.phone
                ? `${formatPhoneForDisplay(guard.user.phone)}`
                : ""}
            </ThemedTextSecondary>
          </View>
          <View
            className="flex-row items-center mt-3 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: basicColors.blue + "15" }}
          >
            <UserShieldIcon width={12} height={12} color={basicColors.blue} />
            <ThemedText
              className="text-xs font-uber-move-medium ml-1.5 tracking-wide"
              style={{ color: basicColors.blue }}
            >
              Guard
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPendingInviteCard = (invite: GuardInvite, index: number) => (
    <TouchableOpacity
      key={invite.id}
      onPress={() => handlePendingInvitePress(invite)}
      activeOpacity={0.7}
      className="px-3 py-5 rounded-xl border"
      style={{
        backgroundColor: themedColors.cardBackground,
        width: "48%",
        marginRight: index % 2 === 0 ? "4%" : 0,
        marginBottom: 12,
        borderColor: themedColors.lightBorder,
        borderWidth: 0.5,
      }}
    >
      <View className="items-center">
        <ProfileIcon username={invite.name || "Invited"} size={56} />
        <View className="mt-2">
          <View className="items-center flex gap-y-0.5">
            <ThemedText
              className="text-base font-uber-move-medium tracking-wide text-center"
              numberOfLines={1}
            >
              {invite.name || "Unknown"}
            </ThemedText>
            <ThemedTextSecondary
              className="text-sm font-uber-move-medium tracking-wide text-center"
              numberOfLines={1}
            >
              {invite.phone ? `${formatPhoneForDisplay(invite.phone)}` : ""}
            </ThemedTextSecondary>
          </View>
          <View className="flex-row items-center justify-center mt-3">
            <HourglassEndIcon
              width={10}
              height={10}
              color={themedColors.secondaryText}
            />
            <ThemedTextSecondary className="text-xs font-uber-move-medium ml-1.5 tracking-wide">
              Pending
            </ThemedTextSecondary>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const hasGuards = guards.length > 0;
  const hasPendingInvites = pendingInvites.length > 0;

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        style={{
          marginTop: insets.top + 6,
        }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={themedColors.accent}
          />
        }
      >
        <View className="pb-2 -mx-3">
          <ThemedHeaderWithBack
            onBackPress={() => router.back()}
            title="manage guards"
          />
        </View>

        {/* Society Info */}
        <View
          className="rounded-xl p-4 mt-3"
          style={{ backgroundColor: themedColors.cardBackground }}
        >
          <ThemedTextSecondary className="font-uber-move-medium text-xs uppercase tracking-wider mb-1">
            Society
          </ThemedTextSecondary>
          <ThemedText className="font-uber-move-medium text-lg">
            {selectedSocietyName}
          </ThemedText>
        </View>

        {hasGuards && (
          <View className="mt-6">
            <ThemedTextSecondary className="text-sm font-uber-move-medium tracking-wider mb-4 ml-1 uppercase">
              Active Guards
            </ThemedTextSecondary>
            <View className="flex-row flex-wrap">
              {guards.map((guard, index) => renderGuardCard(guard, index))}
            </View>
          </View>
        )}

        {hasPendingInvites && (
          <View className="mt-6">
            <ThemedTextSecondary className="text-sm font-uber-move-medium tracking-wider mb-4 ml-1 uppercase">
              Pending Invitations
            </ThemedTextSecondary>
            <View className="flex-row flex-wrap">
              {pendingInvites.map((invite, index) =>
                renderPendingInviteCard(invite, index),
              )}
            </View>
          </View>
        )}

        {!hasGuards && !hasPendingInvites && !isLoading && (
          <View
            className="flex-1 justify-center items-center mx-4"
            style={{ flexGrow: 1 }}
          >
            <EmptyStateView
              title={"No guards yet"}
              subtitle1={
                "Use the button below to invite a guard to your society."
              }
              icon={
                <Image
                  source={emptyViewImage}
                  className="w-48 h-48"
                  resizeMode="contain"
                />
              }
              backgroundColor={basicColors.gray + "50"}
              imageOverflow={true}
            />
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={handleInviteGuard}
        className="absolute w-14 h-14 rounded-full items-center justify-center shadow-lg right-6"
        style={{
          backgroundColor: themedColors.accent,
          bottom: insets.bottom + 24,
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <PlusIcon width={20} height={20} color={themedColors.textOnAccent} />
      </TouchableOpacity>

      <Portal hostName="global">
        {/* Guard Details Bottom Sheet */}
        <BottomSheet
          ref={guardBottomSheetRef}
          index={-1}
          enablePanDownToClose
          enableHandlePanningGesture={true}
          backgroundStyle={{
            backgroundColor: themedColors.modal,
          }}
          handleIndicatorStyle={{
            backgroundColor: themedColors.accent,
          }}
          containerStyle={{
            zIndex: 9999,
            elevation: 9999,
          }}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView
            className="flex-1"
            style={{
              backgroundColor: themedColors.modal,
              paddingBottom: insets.bottom,
            }}
          >
            <View className="px-6 pb-8 pt-6">
              {selectedGuard && (
                <>
                  <View className="items-center mb-6">
                    <ProfileIcon
                      username={selectedGuard.user.name}
                      avatarUrl={selectedGuard.user.photo_url}
                      size={64}
                    />
                    <ThemedText className="text-lg font-uber-move-medium mt-3">
                      {selectedGuard.user.name}
                    </ThemedText>
                    <ThemedTextSecondary className="text-sm font-lato-regular mt-1">
                      {formatPhoneForDisplay(selectedGuard.user.phone)}
                    </ThemedTextSecondary>
                    <View
                      className="flex-row items-center mt-3 px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: basicColors.blue + "15" }}
                    >
                      <UserShieldIcon
                        width={14}
                        height={14}
                        color={basicColors.blue}
                      />
                      <ThemedText
                        className="text-sm font-uber-move-medium ml-2"
                        style={{ color: basicColors.blue }}
                      >
                        Guard
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedTextSecondary className="text-xs font-lato-regular text-center px-4 leading-5 tracking-wide">
                    Guard management features coming soon. You will be able to
                    manage shifts and assignments here.
                  </ThemedTextSecondary>
                </>
              )}
            </View>
          </BottomSheetView>
        </BottomSheet>

        {/* Pending Invite Actions Bottom Sheet */}
        <BottomSheet
          ref={pendingBottomSheetRef}
          index={-1}
          enablePanDownToClose
          enableHandlePanningGesture={true}
          backgroundStyle={{
            backgroundColor: themedColors.modal,
          }}
          handleIndicatorStyle={{
            backgroundColor: themedColors.accent,
          }}
          containerStyle={{
            zIndex: 9999,
            elevation: 9999,
          }}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView
            className="flex-1"
            style={{
              backgroundColor: themedColors.modal,
              paddingBottom: insets.bottom,
            }}
          >
            <View className="px-6 pb-8 pt-6">
              {selectedPendingInvite && (
                <>
                  <View className="items-center mb-6">
                    <ProfileIcon
                      username={selectedPendingInvite.name || "Invited"}
                      size={64}
                    />
                    <ThemedText className="text-lg font-uber-move-medium mt-3">
                      {selectedPendingInvite.name || "Unknown"}
                    </ThemedText>
                    <ThemedTextSecondary className="text-sm font-lato-regular mt-1">
                      {formatPhoneForDisplay(selectedPendingInvite.phone)}
                    </ThemedTextSecondary>
                  </View>

                  <View
                    className="p-3 rounded-lg mb-4"
                    style={{ backgroundColor: themedColors.cardBackground }}
                  >
                    <ThemedTextSecondary className="text-xs font-uber-move-medium tracking-wider uppercase mb-2">
                      Invite Code
                    </ThemedTextSecondary>
                    <ThemedText className="text-xl font-uber-move-bold tracking-widest text-center">
                      {selectedPendingInvite.invite_code}
                    </ThemedText>
                  </View>

                  <TouchableOpacity
                    onPress={handleDiscardInvite}
                    className="flex-row items-center justify-center py-4 rounded-xl"
                    style={{ backgroundColor: basicColors.red + "15" }}
                  >
                    <ThemedText
                      className="font-uber-move-medium text-base tracking-wide"
                      style={{ color: basicColors.red }}
                    >
                      Cancel Invitation
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </BottomSheetView>
        </BottomSheet>

        {isLoading && !isRefreshing && (
          <LoadingOverlay currentTheme={currentTheme} withToast={false} />
        )}
      </Portal>
    </ThemedView>
  );
};

export default ManageGuardsScreen;
