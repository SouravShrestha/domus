import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedView,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import { useAuth } from "@contexts/authContext";
import { getActiveGatesBySociety } from "@api/services/gate.service";
import {
  getGuardsByGate,
  getGuardsBySociety,
  getGuardInvitesBySociety,
  deleteGuardInvite,
  deleteGuardProfile,
  unassignGuardDuty,
} from "@api/services/guard.service";
import { getActiveShiftsBySocietyId } from "@api/services/shift.service";
import { SocietyGate } from "@/types/models/societyGate";
import {
  GuardAssignment,
  GuardInvite,
  GuardProfile,
} from "@/types/models/guard";
import { SocietyShift } from "@/types";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import {
  HourglassEndIcon,
  PlusIcon,
  TimeQuarterToIcon,
} from "@/components/icons";
import basicColors from "@/themes/colors";
import ThemedHeaderWithBack, {
  HeaderMenuItem,
} from "@/components/widgets/ThemedHeaderWithBack";
import { ProfileIcon } from "@/components/widgets/ProfileIcon";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { router } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { appEventEmitter, AppEvents } from "@/utils/eventEmitter";
import Divider from "@/components/widgets/Divider";
import GuardFilterBar, { GuardFilterState } from "./GuardFilterBar";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import PendingGuardInviteBottomSheet from "@/components/widgets/PendingGuardInviteBottomSheet";
import UnassignedGuardBottomSheet from "./UnassignedGuardBottomSheet";
import AssignedGuardBottomSheet from "./AssignedGuardBottomSheet";

type GuardInfo = GuardAssignment & {
  guard: { id: string; name: string; phone: string; photo_url?: string };
  status: "active" | "inactive";
};

type GateWithGuards = SocietyGate & {
  guards: GuardInfo[];
};

type UnassignedGuard = GuardProfile & {
  user: { id: string; name: string; phone: string; photo_url?: string };
};

const formatTime = (time: string | null | undefined): string => {
  if (!time) return "-";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getGuardStatus = (
  shiftStart: string,
  shiftEnd: string,
): "active" | "inactive" => {
  if (!shiftStart || !shiftEnd) return "inactive";

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startHours, startMinutes] = shiftStart.split(":").map(Number);
  const startTotalMinutes = startHours * 60 + startMinutes;

  const [endHours, endMinutes] = shiftEnd.split(":").map(Number);
  const endTotalMinutes = endHours * 60 + endMinutes;

  if (isNaN(startTotalMinutes) || isNaN(endTotalMinutes)) return "inactive";

  if (startTotalMinutes <= endTotalMinutes) {
    if (
      currentMinutes >= startTotalMinutes &&
      currentMinutes <= endTotalMinutes
    ) {
      return "active";
    }
  } else {
    // Overnight shift
    if (
      currentMinutes >= startTotalMinutes ||
      currentMinutes <= endTotalMinutes
    ) {
      return "active";
    }
  }

  return "inactive";
};

const GuardCard: React.FC<{
  guard: GuardInfo;
  onPress?: () => void;
}> = ({ guard, onPress }) => {
  const { themedColors } = useTheme();

  const shiftText =
    guard.shift_start && guard.shift_end
      ? `${formatTime(guard.shift_start)} - ${formatTime(guard.shift_end)}`
      : "Flexible";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="rounded-lg pb-4 pt-5 mr-3 border"
      style={{
        width: 140,
        borderColor: themedColors.lightBorder,
        backgroundColor: themedColors.cardBackground,
      }}
    >
      <View
        className="absolute top-3 right-3 w-2 h-2 rounded-full"
        style={{
          backgroundColor:
            guard.status === "active"
              ? basicColors.brightGreen
              : basicColors.gold,
        }}
      />
      <View className="items-center">
        <ProfileIcon
          username={guard.guard?.name || "Guard"}
          avatarUrl={guard.guard?.photo_url}
          size={48}
        />
        <ThemedText
          className="text-sm font-uber-move-medium mt-2 text-center"
          numberOfLines={1}
        >
          {guard.guard?.name || "Unknown"}
        </ThemedText>
        <ThemedTextSecondary className="text-xs mt-1" numberOfLines={1}>
          {guard.guard?.phone ? formatPhoneForDisplay(guard.guard.phone) : ""}
        </ThemedTextSecondary>
        <View className="flex-row items-center mt-1 py-1">
          <ThemedText className="text-xs font-uber-move-medium">
            {shiftText}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const GateSection: React.FC<{
  gate: GateWithGuards;
  onGuardPress?: (guard: GuardInfo) => void;
}> = ({ gate, onGuardPress }) => {
  const hasGuards = gate.guards.length > 0;

  return (
    <View className="mb-5">
      <View className="pb-3 px-2">
        <ThemedText className="text-lg font-uber-move-medium tracking-wider">
          {gate.name}
        </ThemedText>
        <ThemedTextSecondary className="text-sm mt-0.5">
          {gate.guards.length} {gate.guards.length === 1 ? "guard" : "guards"}{" "}
          assigned
        </ThemedTextSecondary>
      </View>

      {hasGuards && (
        <View className="mt-2 px-2 -mx-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4, flexGrow: 1 }}
            className="px-5"
          >
            {gate.guards.map((guard) => (
              <GuardCard
                key={guard.id}
                guard={guard}
                onPress={() => onGuardPress?.(guard)}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const ManageGuardsScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [gatesWithGuards, setGatesWithGuards] = useState<GateWithGuards[]>([]);
  const [shifts, setShifts] = useState<SocietyShift[]>([]);
  const [unassignedGuards, setUnassignedGuards] = useState<UnassignedGuard[]>(
    [],
  );
  const [pendingInvites, setPendingInvites] = useState<GuardInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<GuardFilterState>({});
  const [selectedPendingInvite, setSelectedPendingInvite] =
    useState<GuardInvite | null>(null);
  const [selectedUnassignedGuard, setSelectedUnassignedGuard] =
    useState<UnassignedGuard | null>(null);
  const [selectedAssignedGuard, setSelectedAssignedGuard] =
    useState<GuardInfo | null>(null);

  const pendingInviteBottomSheetRef = useRef<BottomSheet>(null);
  const unassignedGuardBottomSheetRef = useRef<BottomSheet>(null);
  const assignedGuardBottomSheetRef = useRef<BottomSheet>(null);

  const societyId = currentResidence?.society_id;

  const fetchGatesAndGuards = useCallback(
    async (showRefresh = false) => {
      if (!societyId) return;

      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const { data: gates, error: gatesError } =
          await getActiveGatesBySociety(societyId);

        if (gatesError || !gates) {
          console.error("Error fetching gates:", gatesError);
          setGatesWithGuards([]);
          return;
        }

        const gatesWithGuardsData: GateWithGuards[] = await Promise.all(
          gates.map(async (gate) => {
            const { data: guards } = await getGuardsByGate(gate.id);
            return {
              ...gate,
              guards: (guards || []).map((g) => ({
                ...g,
                status: getGuardStatus(g.shift_start, g.shift_end),
              })) as GuardInfo[],
            };
          }),
        );

        setGatesWithGuards(gatesWithGuardsData);

        // Fetch all guards with profiles and find unassigned ones
        const { data: allGuards } = await getGuardsBySociety(societyId);
        if (allGuards) {
          const assignedGuardProfileIds = new Set(
            gatesWithGuardsData.flatMap((g) =>
              g.guards.map((guard) => guard.guard_profile_id),
            ),
          );
          const unassigned = allGuards.filter(
            (guard) => !assignedGuardProfileIds.has(guard.id),
          ) as UnassignedGuard[];
          setUnassignedGuards(unassigned);
        } else {
          setUnassignedGuards([]);
        }

        // Fetch active shifts
        const { data: activeShifts } =
          await getActiveShiftsBySocietyId(societyId);
        if (activeShifts) {
          setShifts(activeShifts);
        } else {
          setShifts([]);
        }

        // Fetch pending invites
        const { data: invites } = await getGuardInvitesBySociety(societyId);
        if (invites) {
          const pending = invites.filter(
            (invite) => invite.status === "pending",
          );
          setPendingInvites(pending);
        } else {
          setPendingInvites([]);
        }
      } catch (error) {
        console.error("Error fetching gates and guards:", error);
        setGatesWithGuards([]);
        setShifts([]);
        setUnassignedGuards([]);
        setPendingInvites([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [societyId],
  );

  useEffect(() => {
    fetchGatesAndGuards();
  }, [fetchGatesAndGuards]);

  useEffect(() => {
    const unsubscribe = appEventEmitter.on(AppEvents.GUARD_UPDATED, () =>
      fetchGatesAndGuards(false),
    );
    return () => unsubscribe();
  }, [fetchGatesAndGuards]);

  const handleRefresh = () => {
    fetchGatesAndGuards(true);
  };

  const handleFilterChange = useCallback(
    (categoryId: string, values: string[]) => {
      setSelectedFilters((prev) => ({
        ...prev,
        [categoryId]: values,
      }));
    },
    [],
  );

  const handleClearAllFilters = useCallback(() => {
    setSelectedFilters({});
  }, []);

  const filteredGatesWithGuards = useMemo(() => {
    const gateFilters = selectedFilters.gate || [];
    const shiftFilters = selectedFilters.shift || [];
    const statusFilters = selectedFilters.status || [];

    let result = [...gatesWithGuards];

    if (gateFilters.length > 0) {
      result = result.filter((gate) => gateFilters.includes(gate.id));
    }

    // Filter guards within gates
    result = result.map((gate) => {
      let filteredGuards = gate.guards;

      if (shiftFilters.length > 0) {
        filteredGuards = filteredGuards.filter(
          (guard) => guard.shift_id && shiftFilters.includes(guard.shift_id),
        );
      }

      if (statusFilters.length > 0) {
        filteredGuards = filteredGuards.filter((guard) =>
          statusFilters.includes(guard.status),
        );
      }

      return {
        ...gate,
        guards: filteredGuards,
      };
    });

    // Remove gates with no guards if filtering
    // (Optional: depending on UX requirement. Usually we show empty gates or hide them?
    // The previous code kept the gate even if empty but filtered the guards list inside it.
    // The previous code:
    // if (statusFilters.length > 0) { result = result.map(...) }
    // It returned gates with potentially empty guard lists.
    // I will stick to that behavior: returning gates, but with filtered guards list.)

    return result;
  }, [gatesWithGuards, selectedFilters]);

  const filteredUnassignedGuards = useMemo(() => {
    const statusFilters = selectedFilters.status || [];
    const shiftFilters = selectedFilters.shift || [];

    if (shiftFilters.length > 0) {
      return [];
    }

    if (statusFilters.length === 0 || statusFilters.includes("unassigned")) {
      return unassignedGuards;
    }
    return [];
  }, [unassignedGuards, selectedFilters]);

  const totalGuardCount = useMemo(() => {
    const assignedCount = filteredGatesWithGuards.reduce(
      (acc, gate) => acc + gate.guards.length,
      0,
    );
    return assignedCount + filteredUnassignedGuards.length;
  }, [filteredGatesWithGuards, filteredUnassignedGuards]);

  const handleAddGuard = () => {
    router.push({
      pathname: ROUTES.MANAGER.SCREENS.SERVICES.GUARDS.INVITE_GUARD as any,
      params: {
        societyId: societyId,
        societyName: currentResidence?.society?.name || "",
      },
    });
  };

  const handlePendingInvitePress = useCallback((invite: GuardInvite) => {
    setSelectedPendingInvite(invite);
    pendingInviteBottomSheetRef.current?.expand();
  }, []);

  const handleUnassignedGuardPress = useCallback((guard: UnassignedGuard) => {
    setSelectedUnassignedGuard(guard);
    unassignedGuardBottomSheetRef.current?.expand();
  }, []);

  const handleDeleteInvite = useCallback(
    async (inviteId: string) => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        await deleteGuardInvite(inviteId, user.id);
        pendingInviteBottomSheetRef.current?.close();
        setSelectedPendingInvite(null);
        appEventEmitter.emit(AppEvents.GUARD_UPDATED);
      } catch (error) {
        console.error("Error deleting guard invitation:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id],
  );

  const handleRemoveGuard = useCallback(async (guardProfileId: string) => {
    try {
      setIsLoading(true);
      await deleteGuardProfile(guardProfileId);
      unassignedGuardBottomSheetRef.current?.close();
      setSelectedUnassignedGuard(null);
      appEventEmitter.emit(AppEvents.GUARD_UPDATED);
    } catch (error) {
      console.error("Error removing guard:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAssignDuty = useCallback(
    (guardProfileId: string, gateId?: string) => {
      unassignedGuardBottomSheetRef.current?.close();
      const guard = unassignedGuards.find((g) => g.id === guardProfileId);
      router.push({
        pathname: ROUTES.MANAGER.SCREENS.SERVICES.GUARDS.ASSIGN_DUTY as any,
        params: {
          guardProfileId,
          societyId: societyId || "",
          gateId: gateId || "",
          guardName: guard?.user?.name || "",
          guardPhone: guard?.user?.phone || "",
          guardPhotoUrl: guard?.user?.photo_url || "",
        },
      });
    },
    [societyId, unassignedGuards],
  );

  const handleManageTimings = useCallback(() => {
    router.push(ROUTES.MANAGER.SCREENS.SERVICES.GUARDS.MANAGE_TIMINGS as any);
  }, []);

  const handleAssignedGuardPress = useCallback((guard: GuardInfo) => {
    setSelectedAssignedGuard(guard);
    assignedGuardBottomSheetRef.current?.expand();
  }, []);

  const handleUnassignGuard = useCallback(async (assignmentId: string) => {
    try {
      setIsLoading(true);
      await unassignGuardDuty(assignmentId);
      assignedGuardBottomSheetRef.current?.close();
      setSelectedAssignedGuard(null);
      appEventEmitter.emit(AppEvents.GUARD_UPDATED);
    } catch (error) {
      console.error("Error unassigning guard:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEditAssignment = useCallback(
    (assignmentId: string, guard: GuardInfo) => {
      assignedGuardBottomSheetRef.current?.close();
      router.push({
        pathname: ROUTES.MANAGER.SCREENS.SERVICES.GUARDS.EDIT_DUTY as any,
        params: {
          assignmentId,
          societyId: societyId || "",
          guardName: guard.guard?.name || "",
          guardPhone: guard.guard?.phone || "",
          guardPhotoUrl: guard.guard?.photo_url || "",
          currentGateIds: JSON.stringify(guard.gate_ids),
          currentShiftStart: guard.shift_start || "",
          currentShiftEnd: guard.shift_end || "",
          currentAllowAnytimeAccess: guard.allow_anytime_access
            ? "true"
            : "false",
        },
      });
    },
    [societyId],
  );

  const menuItems: HeaderMenuItem[] = useMemo(
    () => [
      {
        label: "Manage timings",
        icon: TimeQuarterToIcon,
        onPress: handleManageTimings,
      },
    ],
    [handleManageTimings],
  );

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

  if (isLoading) {
    return (
      <ThemedView className="flex-1">
        <LoadingOverlay currentTheme={currentTheme} />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <ScrollView
        className="flex-1"
        style={{ marginTop: insets.top + 6, paddingHorizontal: 16 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={themedColors.accent}
          />
        }
      >
        <View className="-mx-2">
          <ThemedHeaderWithBack
            title="security guards"
            menuItems={menuItems}
            onBackPress={() => router.back()}
          />
        </View>

        <View className="mt-5 -mx-4">
          <GuardFilterBar
            gates={gatesWithGuards}
            shifts={shifts}
            unassignedGuards={unassignedGuards}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearAllFilters={handleClearAllFilters}
            resultCount={totalGuardCount}
          />
        </View>

        <View className="mt-10">
          {filteredGatesWithGuards.length > 0 ? (
            filteredGatesWithGuards.map((gate, index) => (
              <React.Fragment key={gate.id}>
                <GateSection
                  gate={gate}
                  onGuardPress={handleAssignedGuardPress}
                />
                {index !== filteredGatesWithGuards.length - 1 && (
                  <Divider className="mt-2 mb-7" />
                )}
              </React.Fragment>
            ))
          ) : (
            <View className="py-12 items-center">
              <ThemedTextSecondary className="text-base text-center">
                No gates found for this society.{"\n"}Add gates to manage
                guards.
              </ThemedTextSecondary>
            </View>
          )}
        </View>

        {filteredUnassignedGuards.length > 0 && (
          <View className="-mx-3">
            <Divider className="mt-5 mb-8" />
            <View className="pb-3 mb-3 px-5">
              <ThemedText className="text-lg font-uber-move-medium tracking-wider">
                Unassigned Guards
              </ThemedText>
              <ThemedTextSecondary className="text-sm mt-0.5">
                {filteredUnassignedGuards.length}{" "}
                {filteredUnassignedGuards.length === 1 ? "guard" : "guards"}{" "}
                without gate assignment
              </ThemedTextSecondary>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              className="px-5"
            >
              {filteredUnassignedGuards.map((guard) => (
                <TouchableOpacity
                  key={guard.id}
                  onPress={() => handleUnassignedGuardPress(guard)}
                  activeOpacity={0.7}
                  className="rounded-md p-4 mr-3 border"
                  style={{
                    width: 140,
                    borderColor: themedColors.lightBorder,
                    backgroundColor: themedColors.cardBackground,
                  }}
                >
                  <View className="items-center">
                    <ProfileIcon
                      username={guard.user?.name || "Guard"}
                      avatarUrl={guard.user?.photo_url}
                      size={48}
                    />
                    <ThemedText
                      className="text-sm font-uber-move-medium mt-2 text-center"
                      numberOfLines={1}
                    >
                      {guard.user?.name || "Unknown"}
                    </ThemedText>
                    <ThemedTextSecondary
                      className="text-xs mt-0.5"
                      numberOfLines={1}
                    >
                      {guard.user?.phone
                        ? formatPhoneForDisplay(guard.user.phone)
                        : ""}
                    </ThemedTextSecondary>
                    <View
                      className="flex-row items-center mt-2.5 px-2 py-1 rounded-full"
                      style={{ backgroundColor: basicColors.gray + "20" }}
                    >
                      <ThemedTextSecondary className="text-xs font-uber-move-medium">
                        No Assignment
                      </ThemedTextSecondary>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {pendingInvites.length > 0 && (
          <View className="mt-2 -mx-3">
            <Divider className="mt-5 mb-8" />
            <View className="pb-3 mb-3 px-5">
              <ThemedText className="text-lg font-uber-move-medium tracking-wider">
                Pending Invitations
              </ThemedText>
              <ThemedTextSecondary className="text-sm mt-0.5">
                {pendingInvites.length}{" "}
                {pendingInvites.length === 1 ? "invite" : "invites"} awaiting
                domus profile creation
              </ThemedTextSecondary>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              className="px-5"
            >
              {pendingInvites.map((invite) => (
                <TouchableOpacity
                  key={invite.id}
                  onPress={() => handlePendingInvitePress(invite)}
                  activeOpacity={0.7}
                  className="rounded-md p-4 mr-3 border"
                  style={{
                    width: 140,
                    borderColor: themedColors.lightBorder,
                    backgroundColor: themedColors.cardBackground,
                  }}
                >
                  <View className="items-center">
                    <ProfileIcon
                      username={invite.name || "Invited"}
                      size={48}
                    />
                    <ThemedText
                      className="text-sm font-uber-move-medium mt-2 text-center"
                      numberOfLines={1}
                    >
                      {invite.name || "Unknown"}
                    </ThemedText>
                    <ThemedTextSecondary
                      className="text-xs mt-0.5"
                      numberOfLines={1}
                    >
                      {invite.phone ? formatPhoneForDisplay(invite.phone) : ""}
                    </ThemedTextSecondary>
                    <View
                      className="flex-row items-center mt-2.5 px-2 py-1 rounded-full"
                      style={{ backgroundColor: basicColors.gold + "20" }}
                    >
                      <HourglassEndIcon
                        width={10}
                        height={10}
                        color={basicColors.gold}
                      />
                      <ThemedText
                        className="text-xs font-uber-move-medium ml-1.5"
                        style={{ color: basicColors.gold }}
                      >
                        Pending
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={handleAddGuard}
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
          ref={pendingInviteBottomSheetRef}
          index={-1}
          enableDynamicSizing={true}
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
            <PendingGuardInviteBottomSheet
              invite={selectedPendingInvite}
              societyName={currentResidence?.society?.name}
              onDeleteInvite={handleDeleteInvite}
            />
          </BottomSheetView>
        </BottomSheet>
        <BottomSheet
          ref={unassignedGuardBottomSheetRef}
          index={-1}
          enableDynamicSizing={true}
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
            <UnassignedGuardBottomSheet
              guard={selectedUnassignedGuard}
              onRemoveGuard={handleRemoveGuard}
              onAssignDuty={handleAssignDuty}
            />
          </BottomSheetView>
        </BottomSheet>
        <BottomSheet
          ref={assignedGuardBottomSheetRef}
          index={-1}
          enableDynamicSizing={true}
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
            <AssignedGuardBottomSheet
              guard={selectedAssignedGuard}
              onUnassign={handleUnassignGuard}
              onEditAssignment={handleEditAssignment}
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

export default ManageGuardsScreen;
