import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    StatusBar,
    View,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, ThemedTextSecondary, ThemedView } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import { useAuth } from "@contexts/authContext";
import { router, useFocusEffect } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { BadgeCheckIcon, HourglassEndIcon, PlusIcon, LockIcon, HoldingHandKeyIcon, EmployeeManAltIcon, SmilingBoyIcon, ShieldCheckIcon, EyeIcon } from "@/components/icons";
import { ROUTES } from "@/constants/routes";
import { appEventEmitter, AppEvents } from "@/utils/eventEmitter";
import { getResidenceMembers } from "@/api/services/residence.service";
import { ResidenceMemberWithProfile, PendingInviteWithDetails } from "@/api/interfaces/residence.interface";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { ProfileIcon } from "@/components/widgets/ProfileIcon";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView } from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import PendingMemberBottomSheet from "@/components/widgets/PendingMemberBottomSheet";
import { deleteInvitation } from "@/api/services/invitation.service";
import basicColors from "@/themes/colors";

const ManageFamilyScreen: React.FC = () => {
    const { themedColors, currentTheme } = useTheme();
    const { currentResidence, isOwner } = useResidence();
    const { profile } = useAuth();
    const insets = useSafeAreaInsets();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [approvedMembers, setApprovedMembers] = useState<ResidenceMemberWithProfile[]>([]);
    const [pendingInvites, setPendingInvites] = useState<PendingInviteWithDetails[]>([]);
    const [selectedPendingInvite, setSelectedPendingInvite] = useState<PendingInviteWithDetails | null>(null);
    
    const bottomSheetRef = useRef<BottomSheet>(null);
    const hasInitiallyLoaded = useRef(false);

    const fetchMembers = useCallback(async (showLoadingOverlay = true) => {
        if (!currentResidence?.id) return;
        
        if (showLoadingOverlay) {
            setIsLoading(true);
        }
        
        try {
            const { data, error } = await getResidenceMembers(currentResidence.id);
            
            if (error) {
                console.error("Error fetching members:", error);
                return;
            }
            
            if (data) {
                setApprovedMembers(data.approved);
                setPendingInvites(data.pending);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [currentResidence?.id]);

    useEffect(() => {
        const unsubscribeMembership = appEventEmitter.on(AppEvents.MEMBERSHIP_UPDATED, () => fetchMembers(false));
        const unsubscribeInvites = appEventEmitter.on(AppEvents.RESIDENCE_INVITES_UPDATED, () => fetchMembers(false));
        const unsubscribePermissions = appEventEmitter.on(AppEvents.PERMISSIONS_UPDATED, () => fetchMembers(false));
        return () => {
            unsubscribeMembership();
            unsubscribeInvites();
            unsubscribePermissions();
        };
    }, [fetchMembers]);

    useFocusEffect(
        useCallback(() => {
            if (!hasInitiallyLoaded.current) {
                hasInitiallyLoaded.current = true;
                fetchMembers();
            }
        }, [fetchMembers])
    );

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchMembers(false);
    }, [fetchMembers]);

    const handlePendingMemberPress = useCallback((invite: PendingInviteWithDetails) => {
        if (!isOwner) return;
        setSelectedPendingInvite(invite);
        bottomSheetRef.current?.expand();
    }, [isOwner]);

    const handleMemberPress = useCallback((member: ResidenceMemberWithProfile) => {
        if (!isOwner && member.user_id !== profile?.id) return;
        router.push({
            pathname: ROUTES.SCREENS.PEOPLE.EDIT_FAMILY_MEMBER_PERMISSIONS,
            params: {
                memberId: member.user_id,
                membershipId: member.id,
                memberName: member.user.name,
                memberPhone: member.user.phone,
                memberPhotoUrl: member.user.photo_url || "",
                memberRole: member.role,
            },
        });
    }, [isOwner, profile?.id]);

    const handleDiscardInvite = useCallback(async (inviteId: string) => {
        try {
            setIsLoading(true);
            await deleteInvitation(
                inviteId,
                profile.id,
                currentResidence.id,
                selectedPendingInvite?.invitee_name || undefined,
                selectedPendingInvite?.user_phone_number,
                selectedPendingInvite?.role,
                currentResidence?.short_name,
                currentResidence?.society?.name
            );
            bottomSheetRef.current?.close();
            setSelectedPendingInvite(null);
        } catch (error) {
            console.error("Error deleting invitation:", error);
        } finally {
            setIsLoading(false);
        }
    }, [profile?.id, currentResidence?.id, selectedPendingInvite, currentResidence?.short_name, currentResidence?.society?.name]);

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
        []
    );

    const getRoleIcon = (role: string): React.ReactNode => {
        const iconProps = { width: 12, height: 12 };
        switch (role.toLowerCase()) {
            case "owner":
                return <HoldingHandKeyIcon {...iconProps} color={basicColors.gold} />;
            case "adult":
                return <EmployeeManAltIcon {...iconProps} color={basicColors.blue} />;
            case "kid":
                return <SmilingBoyIcon {...iconProps} color={basicColors.lightPink} />;
            default:
                return <BadgeCheckIcon {...iconProps} color={themedColors.success} />;
        }
    };

    const getRoleColor = (role: string): string => {
        switch (role.toLowerCase()) {
            case "owner":
                return basicColors.gold;
            case "adult":
                return basicColors.blue;
            case "kid":
                return basicColors.lightPink;
            default:
                return themedColors.success;
        }
    };

    const renderApprovedMemberCard = (
      member: ResidenceMemberWithProfile,
      index: number
    ) => {
      const canPress = isOwner || member.user_id === profile?.id;
      return (
        <TouchableOpacity
          key={member.id}
          onPress={() => handleMemberPress(member)}
          activeOpacity={canPress ? 0.7 : 1}
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
              username={member.user.name}
              avatarUrl={member.user.photo_url}
              size={56}
            />
            {member.role === "owner" && (
              <View
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                style={{ backgroundColor: basicColors.gold }}
              >
                <HoldingHandKeyIcon width={10} height={10} color="#fff" />
              </View>
            )}
          </View>
          <View className="mt-3 items-center">
            <View className="flex items-center gap-y-0.5">
              <ThemedText
                className="text-base font-uber-move-medium tracking-wide text-center"
                numberOfLines={1}
              >
                {member.user.name}
              </ThemedText>
              <ThemedTextSecondary
                className="text-sm font-uber-move-medium tracking-wide text-center"
                numberOfLines={1}
              >
                {member.user.phone
                  ? `${formatPhoneForDisplay(member.user.phone)}`
                  : ""}
              </ThemedTextSecondary>
            </View>
            <View
              className="flex-row items-center mt-3 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: getRoleColor(member.role) + "15" }}
            >
              {getRoleIcon(member.role)}
              <ThemedText
                className="text-xs font-uber-move-medium ml-1.5 tracking-wide"
                style={{ color: getRoleColor(member.role) }}
              >
                {capitalizeFirstLetterOfWords(member.role)}
              </ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      );
    };

    const renderPendingInviteCard = (
      invite: PendingInviteWithDetails,
      index: number
    ) => (
      <TouchableOpacity
        key={invite.id}
        onPress={() => handlePendingMemberPress(invite)}
        activeOpacity={isOwner ? 0.7 : 1}
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
              <HourglassEndIcon width={10} height={10} color={themedColors.secondaryText} />
              <ThemedTextSecondary className="text-xs font-uber-move-medium ml-1.5 tracking-wide">
                Pending
              </ThemedTextSecondary>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );

    const hasMembers = approvedMembers.length > 0;
    const hasPendingInvites = pendingInvites.length > 0;

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
            title="manage my family"
          />
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
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
          {!isOwner && (
            <View
              className="mt-4 px-4 py-3 rounded-md flex items-start justify-between"
              style={{
                backgroundColor: basicColors.gold + "15",
                borderWidth: 1,
                borderColor: basicColors.gold + "30",
              }}
            >
              <View className="items-center justify-center flex-row">
                <EyeIcon width={14} height={14} color={basicColors.gold} />
                <ThemedText
                  className="text-sm font-uber-move-medium ml-2 tracking-wide"
                  style={{ color: basicColors.gold }}
                >
                  View only mode
                </ThemedText>
              </View>
              <View className="flex-1 mt-0.5">
                <ThemedTextSecondary className="text-xs font-lato-regular mt-0.5 tracking-wide">
                  Only residence owners can add or edit family members
                </ThemedTextSecondary>
              </View>
            </View>
          )}

          {hasMembers && (
            <View className="mt-6">
              <ThemedTextSecondary className="text-sm font-uber-move-medium tracking-wider mb-4 ml-1 uppercase">
                Members
              </ThemedTextSecondary>
              <View className="flex-row flex-wrap">
                {approvedMembers.map((member, index) =>
                  renderApprovedMemberCard(member, index)
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
                  renderPendingInviteCard(invite, index)
                )}
              </View>
            </View>
          )}

          {!hasMembers && !hasPendingInvites && !isLoading && (
            <View className="flex-1 items-center justify-center mt-20">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: themedColors.cardBackground }}
              >
                <PlusIcon width={32} height={32} color={themedColors.accent} />
              </View>
              <ThemedText className="text-lg font-uber-move-medium tracking-wide text-center">
                No family members yet
              </ThemedText>
              <ThemedTextSecondary className="text-sm font-lato-regular mt-2 text-center px-8">
                {isOwner
                  ? "Tap the + button below to invite your family members to join your residence."
                  : "Only the residence owner can invite family members."}
              </ThemedTextSecondary>
            </View>
          )}
        </ScrollView>

        {isOwner && (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: ROUTES.SCREENS.PEOPLE.ADD_MEMBER,
                params: { type: "family" },
              })
            }
            className="absolute w-14 h-14 rounded-full items-center justify-center shadow-lg right-6"
            style={{
              backgroundColor: themedColors.accent,
              bottom: insets.bottom + 24,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <PlusIcon
              width={20}
              height={20}
              color={themedColors.textOnAccent}
            />
          </TouchableOpacity>
        )}

        <Portal hostName="global">
          <BottomSheet
            ref={bottomSheetRef}
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

export default ManageFamilyScreen;
