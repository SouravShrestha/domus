import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { View, RefreshControl, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  ThemedView,
  ThemedScrollView,
  ThemedStatusBar,
  ThemedText,
} from "@themes/themedComponents";
import ImageButton from "@/components/widgets/ImageButton";
import { router } from "expo-router";
import { ROUTES } from "@/constants/routes";
import ImageButtonSmall from "@/components/widgets/ImageButtonSmall";
import {
  ImgCab,
  ImgDelivery,
  ImgGatePass,
  ImgInvite,
  ImgManageInvitation,
} from "@/assets/image-icons";
import {
  getUpcomingInvitations,
  getGuestHistory,
  getActiveGuests,
  deleteGuestInvitation,
  recordGuestExit,
} from "@/api/services/visitor.service";
import {
  UnifiedGuestHistoryEntry,
  GuestInvitationWithDetails,
  GuestLogWithInvitation,
} from "@/types/models/visitor";
import { useResidence } from "@/contexts/residenceContext";
import { useTheme } from "@/contexts/themeContext";
import { useAuth } from "@/contexts/authContext";
import {
  showWarningToast,
  showErrorToast,
  showSuccessToast,
} from "@/utils/toast";
import Divider from "@/components/widgets/Divider";
import {
  ChevronDownIcon,
  FilledHeartIcon,
  TimeQuarterToIcon,
  HourglassEndIcon,
} from "@/components/icons";
import TabPill from "@/components/widgets/TabPill";
import GuestList, {
  GuestItem,
  GuestListSkeleton,
} from "@/app/(resident)/screens/visitors/GuestList";
import GuestInvitationQRBottomSheet from "@/app/(resident)/screens/visitors/GuestInvitationQRBottomSheet";
import GuestInsideBottomSheet from "@/app/(resident)/screens/visitors/GuestInsideBottomSheet";
import GuestHistoryBottomSheet from "@/app/(resident)/screens/visitors/GuestHistoryBottomSheet";

type TabType = "already_inside" | "upcoming" | "history";

const Visitors: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentResidence } = useResidence();
  const { themedColors } = useTheme();
  const { user } = useAuth();
  const [visitorHistory, setVisitorHistory] = useState<
    UnifiedGuestHistoryEntry[]
  >([]);
  const [upcomingVisitors, setUpcomingVisitors] = useState<
    GuestInvitationWithDetails[]
  >([]);
  const [insideGuests, setInsideGuests] = useState<GuestLogWithInvitation[]>(
    [],
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingLeft, setIsMarkingLeft] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>("already_inside");

  const upcomingSheetRef = useRef<BottomSheet>(null);
  const insideSheetRef = useRef<BottomSheet>(null);
  const historySheetRef = useRef<BottomSheet>(null);

  const [selectedUpcoming, setSelectedUpcoming] =
    useState<GuestInvitationWithDetails | null>(null);
  const [selectedInside, setSelectedInside] =
    useState<GuestLogWithInvitation | null>(null);
  const [selectedHistory, setSelectedHistory] =
    useState<UnifiedGuestHistoryEntry | null>(null);

  const loadVisitorData = useCallback(async () => {
    if (!currentResidence?.id) return;

    try {
      const [historyResult, upcomingResult, insideResult] = await Promise.all([
        getGuestHistory(currentResidence.id),
        getUpcomingInvitations(currentResidence.id),
        getActiveGuests(currentResidence.id),
      ]);

      if (historyResult.data)
        setVisitorHistory(historyResult.data.slice(0, 10));
      if (upcomingResult.data) setUpcomingVisitors(upcomingResult.data);
      if (insideResult.data) setInsideGuests(insideResult.data);
    } catch (error) {
      console.error("Error loading visitor data:", error);
    } finally {
      setIsInitialLoading(false);
    }
  }, [currentResidence?.id]);

  useEffect(() => {
    loadVisitorData();
  }, [loadVisitorData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVisitorData();
    setRefreshing(false);
  }, [loadVisitorData]);

  const handleGuestPress = useCallback(
    (id: string) => {
      switch (selectedTab) {
        case "already_inside": {
          const guest = insideGuests.find((g) => g.id === id);
          if (guest) {
            setSelectedInside(guest);
            insideSheetRef.current?.expand();
          }
          break;
        }
        case "upcoming": {
          const visitor = upcomingVisitors.find((v) => v.id === id);
          if (visitor) {
            setSelectedUpcoming(visitor);
            upcomingSheetRef.current?.expand();
          }
          break;
        }
        case "history": {
          const entry = visitorHistory.find((e) => e.id === id);
          if (entry) {
            setSelectedHistory(entry);
            historySheetRef.current?.expand();
          }
          break;
        }
      }
    },
    [selectedTab, insideGuests, upcomingVisitors, visitorHistory],
  );

  const handleDeleteInvitation = useCallback(
    async (invitationId: string) => {
      if (!user?.id || !currentResidence) return;

      const invitation = upcomingVisitors.find((v) => v.id === invitationId);
      if (!invitation) return;

      setIsDeleting(true);
      try {
        const { error } = await deleteGuestInvitation(
          invitationId,
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
        upcomingSheetRef.current?.close();
        await loadVisitorData();
      } catch (error: any) {
        showErrorToast(error?.message || "Failed to delete invitation");
      } finally {
        setIsDeleting(false);
      }
    },
    [user?.id, currentResidence, upcomingVisitors, loadVisitorData],
  );

  const handleMarkGuestLeft = useCallback(
    async (logId: string) => {
      setIsMarkingLeft(true);
      try {
        const { error } = await recordGuestExit(logId, "marked_by_resident");
        if (error) throw error;
        showSuccessToast("Guest marked as left");
        insideSheetRef.current?.close();
        await loadVisitorData();
      } catch (error: any) {
        showErrorToast(error?.message || "Failed to mark guest as left");
      } finally {
        setIsMarkingLeft(false);
      }
    },
    [loadVisitorData],
  );

  const tabs = useMemo(
    () => [
      {
        key: "already_inside" as TabType,
        label: "inside",
        icon: (isSelected: boolean) => (
          <FilledHeartIcon
            width={14}
            height={14}
            color={isSelected ? themedColors.accent : themedColors.text}
          />
        ),
      },
      {
        key: "upcoming" as TabType,
        label: "upcoming",
        icon: (isSelected: boolean) => (
          <HourglassEndIcon
            width={12}
            height={12}
            color={isSelected ? themedColors.accent : themedColors.text}
          />
        ),
      },
      {
        key: "history" as TabType,
        label: "history",
        icon: (isSelected: boolean) => (
          <TimeQuarterToIcon
            width={12}
            height={12}
            color={isSelected ? themedColors.accent : themedColors.text}
          />
        ),
        className: "ml-3",
      },
    ],
    [themedColors],
  );

  const currentGuestItems: GuestItem[] = useMemo(() => {
    switch (selectedTab) {
      case "already_inside":
        return insideGuests.map((guest) => ({
          id: guest.id,
          name: guest.guest_invitation.visitor_name,
          phone: guest.guest_invitation.visitor_phone,
          time: guest.entry_time,
        }));
      case "upcoming":
        return upcomingVisitors.map((visitor) => ({
          id: visitor.id,
          name: visitor.visitor_name,
          phone: visitor.visitor_phone,
          time: visitor.valid_from,
        }));
      case "history":
        return visitorHistory.map((entry) => ({
          id: entry.id,
          name: entry.visitor_name,
          phone: entry.visitor_phone || "No phone",
          time: entry.entry_time,
        }));
    }
  }, [selectedTab, insideGuests, upcomingVisitors, visitorHistory]);

  const showViewAll = currentGuestItems.length > 5;

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <ThemedScrollView
        className="flex-1"
        style={{ marginTop: insets.top }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={themedColors.accent}
          />
        }
      >
        <View className="px-5 mt-3">
          <ThemedText className="text-3xl font-uber-move-medium tracking-wider mb-4">
            manage visitors
          </ThemedText>
          <View className="mt-3 flex-row justify-between">
            <View className="w-[48%]">
              <ImageButton
                title="Invite"
                subtitle={"pre-approve \na guest"}
                image={ImgInvite}
                imageSize={96}
                onPress={() =>
                  router.push(ROUTES.SCREENS.VISITORS.INVITE_GUEST)
                }
              />
            </View>
            <View className="w-[49%] justify-between">
              <ImageButtonSmall
                title="Delivery"
                subtitle="approval"
                image={ImgDelivery}
                imageSize={64}
                onPress={() =>
                  router.push(ROUTES.SCREENS.VISITORS.PRE_APPROVE_DELIVERY)
                }
                imageContainerClassName="-mr-[4px]"
              />
              <ImageButtonSmall
                title="Cab"
                subtitle="entry"
                image={ImgCab}
                imageSize={64}
                onPress={() =>
                  router.push(ROUTES.SCREENS.VISITORS.PRE_APPROVE_CAB)
                }
              />
            </View>
          </View>
          <View className="mt-3 justify-between flex-row">
            <ImageButtonSmall
              title="Visitor pass"
              subtitle="manage gate passes for your visitors"
              image={ImgGatePass}
              imageSize={64}
              onPress={() =>
                router.push(ROUTES.SCREENS.VISITORS.MANAGE_VISITORS)
              }
              titleClassName="tracking-wider"
              imageContainerClassName="-mr-[4px]"
              subtitleClassName="tracking-wide"
            />
          </View>
        </View>

        <View className="px-5">
          <Divider className="my-9" />

          <View className="flex-row items-center mb-4 gap-x-2 pl-2">
            {tabs.map((tab) => (
              <TabPill
                key={tab.key}
                label={tab.label}
                isSelected={selectedTab === tab.key}
                onPress={() => setSelectedTab(tab.key)}
                icon={tab.icon(selectedTab === tab.key)}
              />
            ))}
          </View>

          <View className="mt-3">
            {isInitialLoading ? (
              <GuestListSkeleton />
            ) : (
              <GuestList
                items={currentGuestItems}
                onItemPress={handleGuestPress}
              />
            )}
          </View>

          {showViewAll && (
            <TouchableOpacity
              onPress={() =>
                router.push(ROUTES.SCREENS.VISITORS.VISITOR_HISTORY)
              }
              className="mt-6 items-center justify-end flex-row self-end -mr-1"
            >
              <ThemedText
                className="text-sm font-uber-move-medium tracking-wider px-0.5 border-b-[1px] pb-0.5"
                style={{
                  color: themedColors.text,
                  borderColor: themedColors.text,
                }}
              >
                complete schedule
              </ThemedText>
              <View className="-rotate-90 ml-1">
                <ChevronDownIcon
                  width={15}
                  height={15}
                  color={themedColors.text}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ThemedScrollView>

      <GuestInvitationQRBottomSheet
        ref={upcomingSheetRef}
        invitation={selectedUpcoming}
        onClose={() => setSelectedUpcoming(null)}
        onDelete={handleDeleteInvitation}
        isLoading={isDeleting}
      />

      <GuestInsideBottomSheet
        ref={insideSheetRef}
        guest={selectedInside}
        onClose={() => setSelectedInside(null)}
        onMarkLeft={handleMarkGuestLeft}
        isLoading={isMarkingLeft}
      />

      <GuestHistoryBottomSheet
        ref={historySheetRef}
        entry={selectedHistory}
        onClose={() => setSelectedHistory(null)}
      />
    </ThemedView>
  );
};

export default Visitors;
