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
import GuestInvitationQRBottomSheetContent from "@/components/widgets/GuestInvitationQRBottomSheet";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import basicColors from "@themes/colors";
import {
  BarsSortIcon,
  ClockIcon,
  HeartIcon,
  SortAlphaDownIcon,
  TrashXmarkIcon,
  TrendIcon,
} from "@/components/icons";
import Svg, { Path } from "react-native-svg";

type SortOption = "name" | "nextinline";

// Placeholder sort icon component
const SortIcon = ({ width = 16, height = 16, color = "#000" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 7h18M6 12h12M9 17h6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 48; // Single column with padding

const ManageGuestsScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [invitations, setInvitations] = useState<GuestInvitationWithDetails[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInvitation, setSelectedInvitation] =
    useState<GuestInvitationWithDetails | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("nextinline");

  // Sort invitations based on selected option
  const sortedInvitations = useMemo(() => {
    const sorted = [...invitations];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.visitor_name.localeCompare(b.visitor_name));
    } else if (sortBy === "nextinline") {
      sorted.sort(
        (a, b) =>
          new Date(a.valid_from).getTime() - new Date(b.valid_from).getTime()
      );
    }
    return sorted;
  }, [invitations, sortBy]);

  const fetchInvitations = useCallback(async () => {
    if (!currentResidence) return;

    try {
      const { data, error } = await getResidenceGuestInvitations(
        currentResidence.id,
        "active"
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
        currentResidence.short_name
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
    []
  );

  const handleBottomSheetClose = useCallback(() => {
    setSelectedInvitation(null);
  }, []);

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

  const confirmDelete = (invitation: GuestInvitationWithDetails) => {
    Alert.alert(
      "Delete Invitation",
      `Are you sure you want to delete the invitation for ${invitation.visitor_name}? \n\nThis action cannot be undone and would invalidate the pass code.`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: () => handleDelete(invitation),
        },
      ]
    );
  };

  const renderInvitationTicket = ({
    item,
  }: {
    item: GuestInvitationWithDetails;
  }) => {
    return (
      <TouchableOpacity
        onPress={() => handleCardPress(item)}
        activeOpacity={0.7}
        className="rounded-xl overflow-hidden"
        style={{
          width: CARD_WIDTH,
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
            hitSlop={15}
            className="absolute top-3 right-3 p-2 rounded-full"
          >
            <TrashXmarkIcon width={16} height={16} color={basicColors.white} />
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
            width={CARD_WIDTH}
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
        className="flex-1"
        style={{
          marginTop: insets.top,
        }}
      >
        <FlatList
          data={sortedInvitations}
          renderItem={renderInvitationTicket}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: insets.bottom + 20,
            flexGrow: 1,
          }}
          ListHeaderComponent={
            <View className="pb-2 mb-6 -mx-3">
              <ThemedHeaderWithBack
                onBackPress={() => router.back()}
                title="manage invitations"
              />
              {/* Sort Options */}
              <View
                className="flex-row items-center mt-6  mx-3"
                style={{ gap: 12 }}
              >
                <TouchableOpacity
                  onPress={() => setSortBy("name")}
                  className="px-4 py-[5px] rounded-full flex-row items-center"
                  style={{
                    backgroundColor:
                      sortBy === "name"
                        ? themedColors.accent
                        : themedColors.cardBackground,
                    borderWidth: 1,
                    borderColor:
                      sortBy === "name"
                        ? themedColors.accent
                        : themedColors.lightBorder,
                    gap: 6,
                  }}
                >
                  <SortAlphaDownIcon
                    width={12}
                    height={12}
                    color={
                      sortBy === "name"
                        ? themedColors.textOnAccent
                        : themedColors.text
                    }
                  />
                  <ThemedTextSecondary
                    className="text-sm font-uber-move-medium"
                    style={{
                      color:
                        sortBy === "name"
                          ? themedColors.textOnAccent
                          : themedColors.text,
                    }}
                  >
                    Name
                  </ThemedTextSecondary>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortBy("nextinline")}
                  className="px-4 py-[5px] rounded-full flex-row items-center"
                  style={{
                    backgroundColor:
                      sortBy === "nextinline"
                        ? themedColors.accent
                        : themedColors.cardBackground,
                    borderWidth: 1,
                    borderColor:
                      sortBy === "nextinline"
                        ? themedColors.accent
                        : themedColors.lightBorder,
                    gap: 6,
                  }}
                >
                  <TrendIcon
                    width={12}
                    height={12}
                    color={
                      sortBy === "nextinline"
                        ? themedColors.textOnAccent
                        : themedColors.text
                    }
                  />
                  <ThemedTextSecondary
                    className="text-sm font-uber-move-medium"
                    style={{
                      color:
                        sortBy === "nextinline"
                          ? themedColors.textOnAccent
                          : themedColors.text,
                    }}
                  >
                    Upcoming
                  </ThemedTextSecondary>
                </TouchableOpacity>
              </View>
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

      {/* Guest Invitation QR Bottom Sheet */}
      <Portal hostName="global">
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          enablePanDownToClose
          enableDynamicSizing
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
          onChange={(index) => {
            if (index === -1) handleBottomSheetClose();
          }}
        >
          <BottomSheetView
            className="flex-1"
            style={{ backgroundColor: themedColors.modal }}
          >
            <GuestInvitationQRBottomSheetContent
              invitation={selectedInvitation}
            />
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </ThemedView>
  );
};

export default ManageGuestsScreen;
