import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  StatusBar,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  Alert,
  Text,
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
import { useAuth } from "@/contexts/authContext";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { GuestInvitationWithDetails } from "@/types/models/visitor";
import {
  getResidenceGuestInvitations,
  deleteGuestInvitation,
} from "@/api/services/visitor.service";
import { showErrorToast, showWarningToast } from "@/utils/toast";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { format } from "date-fns";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import EmptyStateView from "@/components/widgets/EmptyStateView";
import colorMapping from "@themes/colors";
import emptyViewImage from "@assets/images/girl-empty-box.png";
import WavyBorder from "@/components/widgets/WavyBorder";
import BottomSheet from "@gorhom/bottom-sheet";
import GuestInvitationQRBottomSheet from "./GuestInvitationQRBottomSheet";
import TabPill from "@/components/widgets/TabPill";
import basicColors from "@themes/colors";
import {
  ClockFiveIcon,
  ExpiredIcon,
  HourglassEndIcon,
  PlusIcon,
  TimeQuarterToIcon,
  TrashXmarkIcon,
  TrendIcon,
} from "@/components/icons";
import { ROUTES } from "@/constants/routes";

type FilterOption = "upcoming" | "expired";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ManageGuestsScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [invitations, setInvitations] = useState<GuestInvitationWithDetails[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInvitation, setSelectedInvitation] =
    useState<GuestInvitationWithDetails | null>(null);
  const [filterBy, setFilterBy] = useState<FilterOption>("upcoming");

  const filteredInvitations = useMemo(() => {
    const now = new Date();
    return invitations
      .filter((inv) => {
        const validUntil = new Date(inv.valid_until);
        if (filterBy === "upcoming") {
          return validUntil >= now;
        } else {
          return validUntil < now;
        }
      })
      .sort(
        (a, b) =>
          new Date(a.valid_from).getTime() - new Date(b.valid_from).getTime(),
      );
  }, [invitations, filterBy]);

  const fetchInvitations = useCallback(async () => {
    if (!currentResidence) return;

    try {
      const { data, error } = await getResidenceGuestInvitations(
        currentResidence.id,
        null,
      );

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to fetch invitations");
    }
  }, [currentResidence]);

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

  const handleDelete = async (invitation: GuestInvitationWithDetails) => {
    if (!user?.id || !currentResidence) return;

    try {
      const { error } = await deleteGuestInvitation(
        invitation.id,
        user.id,
        currentResidence.id,
        invitation.visitor_name,
        invitation.visitor_phone,
        invitation.pass_code,
        invitation.purpose,
        currentResidence.short_name,
      );
      if (error) throw error;
      showWarningToast("Invitation deleted");
      await fetchInvitations();
    } catch (error: any) {
      showErrorToast(error?.message || "Failed to delete invitation");
    }
  };

  const handleCardPress = useCallback(
    (invitation: GuestInvitationWithDetails) => {
      setSelectedInvitation(invitation);
      bottomSheetRef.current?.expand();
    },
    [],
  );

  const handleBottomSheetClose = useCallback(() => {
    setSelectedInvitation(null);
  }, []);

  const confirmDelete = (invitation: GuestInvitationWithDetails) => {
    const isExpired = new Date(invitation.valid_until) < new Date();
    const message = isExpired
      ? `Are you sure you want to delete the invitation for ${invitation.visitor_name}? \n\nThis action cannot be undone.`
      : `Are you sure you want to delete the invitation for ${invitation.visitor_name}? \n\nThis action cannot be undone and would invalidate the pass code.`;

    Alert.alert("Delete Invitation", message, [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Delete",
        style: "destructive",
        onPress: () => handleDelete(invitation),
      },
    ]);
  };

  const renderInvitationTicket = ({
    item,
  }: {
    item: GuestInvitationWithDetails;
  }) => {
    const isExpired = new Date(item.valid_until) < new Date();

    return (
      <TouchableOpacity
        onPress={() => handleCardPress(item)}
        activeOpacity={isExpired ? 1 : 0.7}
        disabled={isExpired}
        className="rounded-xl overflow-hidden mx-5"
        style={{
          marginBottom: 24,
          backgroundColor: themedColors.ticketBackground,
          borderColor: themedColors.lightBorder,
          borderWidth: 0.5,
        }}
      >
        {/* Header Section */}
        <View
          className="px-6 pt-6 pb-8 relative"
          style={{ backgroundColor: themedColors.secondary }}
        >
          {/* Delete Button */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              confirmDelete(item);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="absolute top-2 right-2 p-3 rounded-full z-20"
          >
            <TrashXmarkIcon width={18} height={18} color={basicColors.white} />
          </TouchableOpacity>

          <ThemedText
            className="text-lg font-uber-move-medium tracking-wider"
            style={{ color: basicColors.white }}
            numberOfLines={1}
          >
            {item.visitor_name}
          </ThemedText>
          <ThemedText
            className="text-base font-uber-move-medium tracking-wider mt-2"
            style={{ color: basicColors.white }}
          >
            {formatPhoneForDisplay(item.visitor_phone)}
          </ThemedText>
          <WavyBorder
            width={SCREEN_WIDTH}
            fillColor={themedColors.ticketBackground}
            amplitude={3}
            frequency={0.1}
          />
        </View>

        {/* Content Section */}
        <View
          className="px-6 py-4"
          style={{ backgroundColor: themedColors.ticketBackground }}
        >
          {/* Pass Code - Prominent Display */}
          <View
            className="flex-row items-center justify-between mb-4 pb-4 border-b"
            style={{ borderColor: themedColors.lightBorder }}
          >
            <View>
              <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider mb-1">
                Pass Code
              </ThemedTextSecondary>
              <ThemedText className="text-xl font-uber-move-bold tracking-[3px]">
                {item.pass_code}
              </ThemedText>
            </View>
          </View>

          {/* Validity - Horizontal Layout */}
          <View className="flex-row">
            <View className="flex-1">
              <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider mb-1">
                From
              </ThemedTextSecondary>
              <ThemedText className="text-base font-uber-move-medium tracking-wide">
                {format(item.valid_from, "dd MMM")}
              </ThemedText>
              <ThemedTextSecondary className="text-sm font-lato-regular mt-0.5">
                {format(item.valid_from, "hh:mm a")}
              </ThemedTextSecondary>
            </View>
            <View
              className="w-px mx-3"
              style={{ backgroundColor: themedColors.lightBorder }}
            />
            <View className="flex-1">
              <ThemedTextSecondary className="text-[10px] font-lato-regular uppercase tracking-wider mb-1">
                Until
              </ThemedTextSecondary>
              <ThemedText className="text-base font-uber-move-medium tracking-wide">
                {format(item.valid_until, "dd MMM")}
              </ThemedText>
              <ThemedTextSecondary className="text-sm font-lato-regular mt-0.5">
                {format(item.valid_until, "hh:mm a")}
              </ThemedTextSecondary>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      {isLoading && <LoadingOverlay currentTheme={currentTheme} />}
      <View
        className="flex-1 justify-center"
        style={{
          marginTop: insets.top + 6,
        }}
      >
        <FlatList
          data={filteredInvitations}
          renderItem={renderInvitationTicket}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 20,
            flexGrow: 1,
          }}
          ListHeaderComponent={
            <View className="pb-2 mb-6 mx-3">
              <ThemedHeaderWithBack
                onBackPress={() => router.back()}
                title="visitor passes"
              />
              {/* Sort Options */}
              <View className="flex-row items-center mt-6 mx-2">
                <TabPill
                  label="Upcoming"
                  isSelected={filterBy === "upcoming"}
                  onPress={() => setFilterBy("upcoming")}
                  icon={
                    <HourglassEndIcon
                      width={12}
                      height={12}
                      color={
                        filterBy === "upcoming"
                          ? themedColors.accent
                          : themedColors.text
                      }
                    />
                  }
                />
                <TabPill
                  label="Expired"
                  isSelected={filterBy === "expired"}
                  onPress={() => setFilterBy("expired")}
                  icon={
                    <TimeQuarterToIcon
                      width={12}
                      height={12}
                      color={
                        filterBy === "expired"
                          ? themedColors.accent
                          : themedColors.text
                      }
                    />
                  }
                />
              </View>

              {filterBy === "expired" && (
                <View
                  className="mx-2 mt-6 px-4 py-2 -mb-2 rounded-lg"
                  style={{ backgroundColor: basicColors.orange + "20" }}
                >
                  <Text
                    className="text-sm font-uber-move-medium text-center"
                    style={{ color: basicColors.orange }}
                  >
                    Passes older than 5 days are automatically deleted
                  </Text>
                </View>
              )}
            </View>
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={themedColors.accent}
            />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View className="flex-1 justify-center items-center">
                <EmptyStateView
                  title={"No invitations found"}
                  subtitle1={"Create a guest invitation to get started"}
                  icon={
                    <Image
                      source={emptyViewImage}
                      className="w-56 h-56 -mt-3"
                      resizeMode="contain"
                    />
                  }
                  backgroundColor={colorMapping.gray + "50"}
                  imageOverflow={true}
                />
              </View>
            ) : null
          }
        />
      </View>

      <TouchableOpacity
        onPress={() =>
          router.replace({
            pathname: ROUTES.RESIDENT.SCREENS.VISITORS.INVITE_GUEST,
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

      <GuestInvitationQRBottomSheet
        ref={bottomSheetRef}
        invitation={selectedInvitation}
        onClose={handleBottomSheetClose}
      />
    </ThemedView>
  );
};

export default ManageGuestsScreen;
