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
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import {
  HourglassEndIcon,
  PlusIcon,
  HoldingHandKeyIcon,
  SwapIcon,
} from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { appEventEmitter, AppEvents } from "@/utils/eventEmitter";
import { residenceRepository } from "@/api/repositories/residence/residence.repository";
import {
  ResidenceMemberWithProfile,
  PendingInviteWithDetails,
} from "@/api/interfaces/residence.interface";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { ProfileIcon } from "@/components/widgets/ProfileIcon";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import PendingMemberBottomSheet from "@/components/widgets/PendingMemberBottomSheet";
import { deleteInvitation } from "@/api/services/invitation.service";
import basicColors from "@/themes/colors";
import EmptyStateView from "@/components/widgets/EmptyStateView";
import { Image } from "expo-image";
import emptyViewImage from "@assets/images/girl-empty-box.png";

const ManageOwnersScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    residenceId: string;
    residenceName: string;
    block: string;
    floorNumber: string;
  }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [approvedOwners, setApprovedOwners] = useState<
    ResidenceMemberWithProfile[]
  >([]);
  const [pendingInvites, setPendingInvites] = useState<
    PendingInviteWithDetails[]
  >([]);
  const [selectedOwner, setSelectedOwner] =
    useState<ResidenceMemberWithProfile | null>(null);
  const [selectedPendingInvite, setSelectedPendingInvite] =
    useState<PendingInviteWithDetails | null>(null);

  const ownerBottomSheetRef = useRef<BottomSheet>(null);
  const pendingBottomSheetRef = useRef<BottomSheet>(null);
  const hasInitiallyLoaded = useRef(false);

  const fetchOwners = useCallback(
    async (showLoadingOverlay = true) => {
      if (!params.residenceId) return;

      if (showLoadingOverlay) {
        setIsLoading(true);
      }

      try {
        const { data, error } =
          await residenceRepository.findMembersByResidenceId(
            params.residenceId,
          );

        if (error) {
          console.error("Error fetching owners:", error);
          return;
        }

        if (data) {
          const owners = data.approved.filter(
            (m) => m.role?.toLowerCase() === "owner",
          );
          const pendingOwners = data.pending.filter(
            (p) => p.role?.toLowerCase() === "owner",
          );
          setApprovedOwners(owners);
          setPendingInvites(pendingOwners);
        }
      } catch (error) {
        console.error("Error fetching owners:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [params.residenceId],
  );

  useEffect(() => {
    const unsubscribeMembership = appEventEmitter.on(
      AppEvents.MEMBERSHIP_UPDATED,
      () => fetchOwners(false),
    );
    const unsubscribeInvites = appEventEmitter.on(
      AppEvents.RESIDENCE_INVITES_UPDATED,
      () => fetchOwners(false),
    );
    return () => {
      unsubscribeMembership();
      unsubscribeInvites();
    };
  }, [fetchOwners]);

  useFocusEffect(
    useCallback(() => {
      if (!hasInitiallyLoaded.current) {
        hasInitiallyLoaded.current = true;
        fetchOwners();
      }
    }, [fetchOwners]),
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchOwners(false);
  }, [fetchOwners]);

  const handleOwnerPress = useCallback((owner: ResidenceMemberWithProfile) => {
    setSelectedOwner(owner);
    ownerBottomSheetRef.current?.expand();
  }, []);

  const handlePendingInvitePress = useCallback(
    (invite: PendingInviteWithDetails) => {
      setSelectedPendingInvite(invite);
      pendingBottomSheetRef.current?.expand();
    },
    [],
  );

  const handleConvertToAdult = useCallback(async () => {
    if (!selectedOwner || approvedOwners.length <= 1) {
      Alert.alert(
        "Cannot Convert",
        "A residence must have at least one owner.",
      );
      return;
    }

    Alert.alert(
      "Convert to Adult",
      `Are you sure you want to convert ${selectedOwner.user.name} from owner to adult member?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Convert",
          onPress: async () => {
            try {
              setIsLoading(true);
              ownerBottomSheetRef.current?.close();
              const { error } = await residenceRepository.convertOwnerToAdult(
                selectedOwner.id,
              );
              if (error) {
                throw error;
              }
              setSelectedOwner(null);
              appEventEmitter.emit(AppEvents.MEMBERSHIP_UPDATED);
            } catch (error) {
              console.error("Error converting owner to adult:", error);
              Alert.alert(
                "Error",
                "Failed to convert owner. Please try again.",
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  }, [selectedOwner, approvedOwners.length]);

  const handleDiscardInvite = useCallback(
    async (inviteId: string) => {
      try {
        setIsLoading(true);
        await deleteInvitation(
          inviteId,
          user?.id || "",
          params.residenceId,
          selectedPendingInvite?.invitee_name || undefined,
          selectedPendingInvite?.user_phone_number,
          selectedPendingInvite?.role,
          params.residenceName,
          undefined,
        );
        pendingBottomSheetRef.current?.close();
        setSelectedPendingInvite(null);
      } catch (error) {
        console.error("Error deleting invitation:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, params.residenceId, params.residenceName, selectedPendingInvite],
  );

  const handleInviteOwner = useCallback(() => {
    router.push({
      pathname: ROUTES.MANAGER.SCREENS.RESIDENCES.ADD_OWNER as any,
      params: {
        residenceId: params.residenceId,
        residenceName: params.residenceName,
        block: params.block,
        floorNumber: params.floorNumber,
      },
    });
  }, [
    params.residenceId,
    params.residenceName,
    params.block,
    params.floorNumber,
  ]);

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

  const renderOwnerCard = (
    owner: ResidenceMemberWithProfile,
    index: number,
  ) => (
    <TouchableOpacity
      key={owner.id}
      onPress={() => handleOwnerPress(owner)}
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
            username={owner.user.name}
            avatarUrl={owner.user.photo_url}
            size={56}
          />
          <View
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
            style={{ backgroundColor: basicColors.gold }}
          >
            <HoldingHandKeyIcon width={10} height={10} color="#fff" />
          </View>
        </View>
        <View className="mt-3 items-center">
          <View className="flex items-center gap-y-0.5">
            <ThemedText
              className="text-base font-uber-move-medium tracking-wide text-center"
              numberOfLines={1}
            >
              {owner.user.name}
            </ThemedText>
            <ThemedTextSecondary
              className="text-sm font-uber-move-medium tracking-wide text-center"
              numberOfLines={1}
            >
              {owner.user.phone
                ? `${formatPhoneForDisplay(owner.user.phone)}`
                : ""}
            </ThemedTextSecondary>
          </View>
          <View
            className="flex-row items-center mt-3 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: basicColors.gold + "15" }}
          >
            <HoldingHandKeyIcon
              width={12}
              height={12}
              color={basicColors.gold}
            />
            <ThemedText
              className="text-xs font-uber-move-medium ml-1.5 tracking-wide"
              style={{ color: basicColors.gold }}
            >
              Owner
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPendingInviteCard = (
    invite: PendingInviteWithDetails,
    index: number,
  ) => (
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
        <ProfileIcon username={invite.invitee_name || "Invited"} size={56} />
        <View className="mt-2">
          <View className="items-center flex gap-y-0.5">
            <ThemedText
              className="text-base font-uber-move-medium tracking-wide text-center"
              numberOfLines={1}
            >
              {invite.invitee_name || "Unknown"}
            </ThemedText>
            <ThemedTextSecondary
              className="text-sm font-uber-move-medium tracking-wide text-center"
              numberOfLines={1}
            >
              {invite.user_phone_number
                ? `${formatPhoneForDisplay(invite.user_phone_number)}`
                : ""}
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

  const hasOwners = approvedOwners.length > 0;
  const hasPendingInvites = pendingInvites.length > 0;
  const canConvertToAdult = approvedOwners.length > 1;

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
            title="manage owners"
          />
        </View>
        {/* Residence Info */}
        <View
          className="rounded-xl p-4 mt-3"
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
        {hasOwners && (
          <View className="mt-6">
            <ThemedTextSecondary className="text-sm font-uber-move-medium tracking-wider mb-4 ml-1 uppercase">
              Owners
            </ThemedTextSecondary>
            <View className="flex-row flex-wrap">
              {approvedOwners.map((owner, index) =>
                renderOwnerCard(owner, index),
              )}
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

        {!hasOwners && !hasPendingInvites && !isLoading && (
          <View
            className="flex-1 justify-center items-center mx-4"
            style={{ flexGrow: 1 }}
          >
            <EmptyStateView
              title={"No owners yet"}
              subtitle1={
                "Use the button below to invite an owner to this residence."
              }
              icon={
                <Image
                  source={emptyViewImage}
                  className="w-48 h-48"
                  contentFit="contain"
                />
              }
              backgroundColor={basicColors.gray + "50"}
              imageOverflow={true}
            />
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={handleInviteOwner}
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
        {/* Owner Actions Bottom Sheet */}
        <BottomSheet
          ref={ownerBottomSheetRef}
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
              {selectedOwner && (
                <>
                  <View className="items-center mb-6">
                    <ProfileIcon
                      username={selectedOwner.user.name}
                      avatarUrl={selectedOwner.user.photo_url}
                      size={64}
                    />
                    <ThemedText className="text-lg font-uber-move-medium mt-3">
                      {selectedOwner.user.name}
                    </ThemedText>
                    <ThemedTextSecondary className="text-sm font-lato-regular mt-1">
                      {formatPhoneForDisplay(selectedOwner.user.phone)}
                    </ThemedTextSecondary>
                  </View>

                  <TouchableOpacity
                    onPress={handleConvertToAdult}
                    disabled={!canConvertToAdult}
                    className="flex-row items-center justify-center py-4 rounded-xl"
                    style={{
                      backgroundColor: canConvertToAdult
                        ? themedColors.accent + "15"
                        : themedColors.disabled + "30",
                    }}
                  >
                    <SwapIcon
                      width={18}
                      height={18}
                      color={
                        canConvertToAdult
                          ? themedColors.accent
                          : themedColors.secondaryText
                      }
                    />
                    <ThemedText
                      className="font-uber-move-medium text-base tracking-wide ml-2"
                      style={{
                        color: canConvertToAdult
                          ? themedColors.accent
                          : themedColors.secondaryText,
                      }}
                    >
                      Convert to Adult
                    </ThemedText>
                  </TouchableOpacity>

                  {!canConvertToAdult && (
                    <ThemedTextSecondary className="text-xs font-lato-regular mt-3 text-center leading-5 tracking-wide">
                      Unable to update, a residence must have at least one owner
                    </ThemedTextSecondary>
                  )}

                  {canConvertToAdult && (
                    <ThemedTextSecondary className="text-xs font-lato-regular mt-4 text-center px-4 leading-5 tracking-wide">
                      This will convert the owner to an adult member type and
                      will not remove their residence access. {"\n"}
                      To remove a member, the owner can do that from their app.
                    </ThemedTextSecondary>
                  )}
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
            style={{ backgroundColor: themedColors.modal }}
          >
            <PendingMemberBottomSheet
              invite={selectedPendingInvite}
              onDiscardInvite={handleDiscardInvite}
            />
          </BottomSheetView>
        </BottomSheet>

        {isLoading && !isRefreshing && (
          <LoadingOverlay currentTheme={currentTheme} withToast={false} />
        )}
      </Portal>
    </ThemedView>
  );
};

export default ManageOwnersScreen;
