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
import { BadgeCheckIcon, HourglassEndIcon, PlusIcon } from "@/components/icons";
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

const ManageFamilyScreen: React.FC = () => {
    const { themedColors, currentTheme } = useTheme();
    const { currentResidence } = useResidence();
    const { profile } = useAuth();
    const insets = useSafeAreaInsets();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [approvedMembers, setApprovedMembers] = useState<ResidenceMemberWithProfile[]>([]);
    const [pendingInvites, setPendingInvites] = useState<PendingInviteWithDetails[]>([]);
    const [selectedPendingInvite, setSelectedPendingInvite] = useState<PendingInviteWithDetails | null>(null);
    
    const bottomSheetRef = useRef<BottomSheet>(null);

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
        return () => {
            unsubscribeMembership();
            unsubscribeInvites();
        };
    }, [fetchMembers]);

    useFocusEffect(
        useCallback(() => {
            fetchMembers();
        }, [fetchMembers])
    );

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchMembers(false);
    }, [fetchMembers]);

    const handlePendingMemberPress = useCallback((invite: PendingInviteWithDetails) => {
        setSelectedPendingInvite(invite);
        bottomSheetRef.current?.expand();
    }, []);

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

    const renderApprovedMemberCard = (
      member: ResidenceMemberWithProfile,
      index: number
    ) => (
      <View
        key={member.id}
        className="px-3 py-5 rounded-md"
        style={{
          backgroundColor: themedColors.cardBackground,
          width: "48%",
          marginRight: index % 2 === 0 ? "4%" : 0,
          marginBottom: 12,
        }}
      >
        <View className="items-center">
          <ProfileIcon
            username={member.user.name}
            avatarUrl={member.user.photo_url}
            size={56}
          />
          <View className="mt-3 items-center">
            <View className="flex items-center gap-y-1">
              <ThemedText
                className="text-sm font-uber-move-medium tracking-wide text-center"
                numberOfLines={1}
              >
                {member.user.name}
              </ThemedText>
              <ThemedTextSecondary
                className="text-xs font-uber-move-medium tracking-wide text-center"
                numberOfLines={1}
              >
                {member.user.phone
                  ? `${formatPhoneForDisplay(member.user.phone)}`
                  : ""}
              </ThemedTextSecondary>
            </View>
            <View className="flex-row items-center mt-3">
              <BadgeCheckIcon
                width={12}
                height={12}
                color={themedColors.success}
              />
              <ThemedTextSecondary className="text-xs font-uber-move-medium ml-1.5 tracking-wide">
                {capitalizeFirstLetterOfWords(member.role)}
              </ThemedTextSecondary>
            </View>
          </View>
        </View>
      </View>
    );

    const renderPendingInviteCard = (
      invite: PendingInviteWithDetails,
      index: number
    ) => (
      <TouchableOpacity
        key={invite.id}
        onPress={() => handlePendingMemberPress(invite)}
        activeOpacity={0.7}
        className="px-3 py-5 rounded-md"
        style={{
          backgroundColor: themedColors.cardBackground,
          width: "48%",
          marginRight: index % 2 === 0 ? "4%" : 0,
          marginBottom: 12,
        }}
      >
        <View className="items-center">
          <ProfileIcon username={invite.invitee_name || "Invited"} size={56} />
          <View className="mt-3">
            <View className="items-center flex gap-y-1">
              <ThemedText
                className="text-sm font-uber-move-medium tracking-wide text-center"
                numberOfLines={1}
              >
                {invite.invitee_name || "Unknown"}
              </ThemedText>
              <ThemedTextSecondary
                className="text-xs font-uber-move-medium tracking-wide text-center"
                numberOfLines={1}
              >
                {invite.user_phone_number
                  ? `${formatPhoneForDisplay(invite.user_phone_number)}`
                  : ""}
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
            title="My Family"
          />
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={themedColors.accent}
            />
          }
        >
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
                Tap the + button below to invite your family members to join
                your residence.
              </ThemedTextSecondary>
            </View>
          )}
        </ScrollView>

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
          <PlusIcon width={20} height={20} color={themedColors.textOnAccent} />
        </TouchableOpacity>

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
