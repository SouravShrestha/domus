import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { View, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  ThemedView,
  ThemedScrollView,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { router } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { useResidence } from "@/contexts/residenceContext";
import { useAuth } from "@/contexts/authContext";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import {
  UnifiedGuestHistoryEntry,
  GuestInvitationWithDetails,
  GuestLogWithInvitation,
} from "@/types/models/visitor";
import { CabInvite } from "@/types/models/cab";
import {
  getUpcomingInvitations,
  getGuestHistory,
  getActiveGuests,
  deleteGuestInvitation,
  recordGuestExit,
} from "@/api/services/visitor.service";
import {
  getUpcomingCabs,
  getActiveCabs,
  getCabHistory,
  deleteCabInvite,
  markCabVisited,
} from "@/api/services/cab.service";
import {
  showWarningToast,
  showErrorToast,
  showSuccessToast,
} from "@/utils/toast";
import {
  FilledHeartIcon,
  HourglassEndIcon,
  TimeQuarterToIcon,
} from "@/components/icons";
import TabPill from "@/components/widgets/TabPill";
import GuestList, {
  GuestItem,
  GuestListSkeleton,
} from "@/app/(resident)/screens/visitors/GuestList";
import GuestInvitationQRBottomSheet from "@/app/(resident)/screens/visitors/GuestInvitationQRBottomSheet";
import GuestInsideBottomSheet from "@/app/(resident)/screens/visitors/GuestInsideBottomSheet";
import GuestHistoryBottomSheet from "@/app/(resident)/screens/visitors/GuestHistoryBottomSheet";
import CabInviteBottomSheet from "@/app/(resident)/screens/visitors/CabInviteBottomSheet";

type TabType = "already_inside" | "upcoming" | "history";

const GuestHistoryScreen: React.FC = () => {
  const { themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [visitorHistory, setVisitorHistory] = useState<
    UnifiedGuestHistoryEntry[]
  >([]);
  const [upcomingVisitors, setUpcomingVisitors] = useState<
    GuestInvitationWithDetails[]
  >([]);
  const [insideGuests, setInsideGuests] = useState<GuestLogWithInvitation[]>(
    [],
  );
  const [upcomingCabs, setUpcomingCabs] = useState<CabInvite[]>([]);
  const [activeCabs, setActiveCabs] = useState<CabInvite[]>([]);
  const [cabHistoryList, setCabHistoryList] = useState<CabInvite[]>([]);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingLeft, setIsMarkingLeft] = useState(false);
  const [isCabActionLoading, setIsCabActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>("already_inside");

  const upcomingSheetRef = useRef<BottomSheet>(null);
  const insideSheetRef = useRef<BottomSheet>(null);
  const historySheetRef = useRef<BottomSheet>(null);
  const cabSheetRef = useRef<BottomSheet>(null);

  const [selectedUpcoming, setSelectedUpcoming] =
    useState<GuestInvitationWithDetails | null>(null);
  const [selectedInside, setSelectedInside] =
    useState<GuestLogWithInvitation | null>(null);
  const [selectedHistory, setSelectedHistory] =
    useState<UnifiedGuestHistoryEntry | null>(null);
  const [selectedCab, setSelectedCab] = useState<CabInvite | null>(null);

  const loadVisitorData = useCallback(async () => {
    if (!currentResidence?.id) return;

    try {
      const [
        historyResult,
        upcomingResult,
        insideResult,
        upcomingCabsResult,
        activeCabsResult,
        cabHistoryResult,
      ] = await Promise.all([
        getGuestHistory(currentResidence.id),
        getUpcomingInvitations(currentResidence.id),
        getActiveGuests(currentResidence.id),
        getUpcomingCabs(currentResidence.id),
        getActiveCabs(currentResidence.id),
        getCabHistory(currentResidence.id),
      ]);

      if (historyResult.data) setVisitorHistory(historyResult.data);
      if (upcomingResult.data) setUpcomingVisitors(upcomingResult.data);
      if (insideResult.data) setInsideGuests(insideResult.data);
      if (upcomingCabsResult.data) setUpcomingCabs(upcomingCabsResult.data);
      if (activeCabsResult.data) setActiveCabs(activeCabsResult.data);
      if (cabHistoryResult.data) setCabHistoryList(cabHistoryResult.data);
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
          const cab = activeCabs.find((c) => c.id === id);
          if (cab) {
            setSelectedCab(cab);
            cabSheetRef.current?.expand();
            return;
          }
          const guest = insideGuests.find((g) => g.id === id);
          if (guest) {
            setSelectedInside(guest);
            insideSheetRef.current?.expand();
          }
          break;
        }
        case "upcoming": {
          const cab = upcomingCabs.find((c) => c.id === id);
          if (cab) {
            setSelectedCab(cab);
            cabSheetRef.current?.expand();
            return;
          }
          const visitor = upcomingVisitors.find((v) => v.id === id);
          if (visitor) {
            setSelectedUpcoming(visitor);
            upcomingSheetRef.current?.expand();
          }
          break;
        }
        case "history": {
          const cab = cabHistoryList.find((c) => c.id === id);
          if (cab) {
            setSelectedCab(cab);
            cabSheetRef.current?.expand();
            return;
          }
          const entry = visitorHistory.find((e) => e.id === id);
          if (entry) {
            setSelectedHistory(entry);
            historySheetRef.current?.expand();
          }
          break;
        }
      }
    },
    [
      selectedTab,
      insideGuests,
      upcomingVisitors,
      visitorHistory,
      activeCabs,
      upcomingCabs,
      cabHistoryList,
    ],
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
      } catch (error: Error | unknown) {
        showErrorToast(
          (error as Error)?.message || "Failed to delete invitation",
        );
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
      } catch (error: Error | unknown) {
        showErrorToast(
          (error as Error)?.message || "Failed to mark guest as left",
        );
      } finally {
        setIsMarkingLeft(false);
      }
    },
    [loadVisitorData],
  );

  const handleDeleteCab = useCallback(
    async (cabId: string) => {
      setIsCabActionLoading(true);
      try {
        const { error } = await deleteCabInvite(cabId);
        if (error) throw error;
        showWarningToast("Cab invite deleted");
        cabSheetRef.current?.close();
        await loadVisitorData();
      } catch (error: Error | unknown) {
        showErrorToast(
          (error as Error)?.message || "Failed to delete cab invite",
        );
      } finally {
        setIsCabActionLoading(false);
      }
    },
    [loadVisitorData],
  );

  const handleMarkCabCompleted = useCallback(
    async (cabId: string) => {
      setIsCabActionLoading(true);
      try {
        const { error } = await markCabVisited(cabId);
        if (error) throw error;
        showSuccessToast("Cab ride marked as completed");
        cabSheetRef.current?.close();
        await loadVisitorData();
      } catch (error: Error | unknown) {
        showErrorToast(
          (error as Error)?.message || "Failed to update cab invite",
        );
      } finally {
        setIsCabActionLoading(false);
      }
    },
    [loadVisitorData],
  );

  const mapCabToGuestItem = (cab: CabInvite): GuestItem => ({
    id: cab.id,
    name: cab.driver_name || cab.cab_type,
    phone: cab.vehicle_number || "Taxi",
    time: cab.valid_from,
    imageKey: cab.cab_type,
    itemType: "cab",
  });

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
      },
    ],
    [themedColors],
  );

  const currentGuestItems: GuestItem[] = useMemo(() => {
    switch (selectedTab) {
      case "already_inside":
        return [
          ...insideGuests.map((guest) => ({
            id: guest.id,
            name: guest.guest_invitation.visitor_name,
            phone: guest.guest_invitation.visitor_phone,
            time: guest.entry_time,
          })),
          ...activeCabs.map(mapCabToGuestItem),
        ];
      case "upcoming":
        return [
          ...upcomingVisitors.map((visitor) => ({
            id: visitor.id,
            name: visitor.visitor_name,
            phone: visitor.visitor_phone,
            time: visitor.valid_from,
          })),
          ...upcomingCabs.map(mapCabToGuestItem),
        ];
      case "history":
        return [
          ...visitorHistory.map((entry) => ({
            id: entry.id,
            name: entry.visitor_name,
            phone: entry.visitor_phone || "No phone",
            time: entry.entry_time,
          })),
          ...cabHistoryList.map(mapCabToGuestItem),
        ];
    }
  }, [
    selectedTab,
    insideGuests,
    upcomingVisitors,
    visitorHistory,
    activeCabs,
    upcomingCabs,
    cabHistoryList,
  ]);

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <ThemedScrollView
        className="flex-1"
        style={{ marginTop: insets.top + 6 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 32,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={themedColors.accent}
          />
        }
      >
        <View className="px-3">
          <ThemedHeaderWithBack
            onBackPress={() => router.back()}
            title="guest history"
          />

          <View className="flex-row items-center mt-6 gap-x-2 pl-2 px-5">
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

          <View className="mt-8 px-3">
            {isInitialLoading ? (
              <GuestListSkeleton />
            ) : (
              <GuestList
                items={currentGuestItems}
                onItemPress={handleGuestPress}
                maxItems={currentGuestItems.length}
              />
            )}
          </View>
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

      <CabInviteBottomSheet
        ref={cabSheetRef}
        cabInvite={selectedCab}
        onClose={() => setSelectedCab(null)}
        onDelete={handleDeleteCab}
        onMarkCompleted={handleMarkCabCompleted}
        isLoading={isCabActionLoading}
      />
    </ThemedView>
  );
};

export default GuestHistoryScreen;
