import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import SearchBar from "@components/widgets/SearchBar";
import EmptyStateView from "@components/widgets/EmptyStateView";
import PersonListItem, { PersonItemData } from "./PersonListItem";
import FilterChips, { FilterOption } from "./FilterChips";
import { getGuardsBySocietyId, getPendingGuardInvitesBySocietyId } from "@/api/services/guard.service";
import type { SocietyGuardWithDetails } from "@/api/interfaces/guard.interface";
import type { SocietyGuardInvite } from "@/types";
import { showErrorToast } from "@/utils/toast";
import basicColors from "@/themes/colors";
import { UsersIcon, PlusIcon } from "@/components/icons";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";

interface GuardEntry {
  id: string;
  type: "active" | "pending";
  name: string;
  phone: string;
  photo_url?: string | null;
  status: string;
  created_at: string;
}

const filterOptions: FilterOption[] = [
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "pending", label: "Pending Invite" },
];

const SecurityGuardsTab: React.FC = () => {
  const { themedColors } = useTheme();
  const { currentResidence } = useResidence();

  const [guards, setGuards] = useState<GuardEntry[]>([]);
  const [filteredGuards, setFilteredGuards] = useState<GuardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const fetchGuards = useCallback(
    async (showRefreshIndicator = false) => {
      if (!currentResidence?.society_id) {
        setIsLoading(false);
        return;
      }

      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const [guardsResult, invitesResult] = await Promise.all([
          getGuardsBySocietyId(currentResidence.society_id),
          getPendingGuardInvitesBySocietyId(currentResidence.society_id),
        ]);

        const allGuards: GuardEntry[] = [];

        if (guardsResult.data) {
          for (const guard of guardsResult.data) {
            allGuards.push({
              id: guard.id,
              type: "active",
              name: guard.user.name,
              phone: guard.user.phone,
              photo_url: guard.user.photo_url,
              status: guard.status,
              created_at: guard.created_at,
            });
          }
        }

        if (invitesResult.data) {
          for (const invite of invitesResult.data) {
            allGuards.push({
              id: invite.id,
              type: "pending",
              name: invite.name || "Invited Guard",
              phone: invite.phone,
              status: "pending",
              created_at: invite.created_at,
            });
          }
        }

        allGuards.sort((a, b) => {
          if (a.status === "active" && b.status !== "active") return -1;
          if (a.status !== "active" && b.status === "active") return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setGuards(allGuards);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        showErrorToast("Failed to load guards");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentResidence?.society_id, fadeAnim, slideAnim]
  );

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      fetchGuards();
    }, [fetchGuards])
  );

  useEffect(() => {
    let filtered = guards;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.phone.toLowerCase().includes(query)
      );
    }

    if (selectedFilter) {
      switch (selectedFilter) {
        case "active":
          filtered = filtered.filter((g) => g.status === "active");
          break;
        case "inactive":
          filtered = filtered.filter((g) => g.status === "inactive");
          break;
        case "pending":
          filtered = filtered.filter((g) => g.type === "pending");
          break;
      }
    }

    setFilteredGuards(filtered);
  }, [guards, searchQuery, selectedFilter]);

  const getStatusBadge = (guard: GuardEntry) => {
    if (guard.type === "pending") {
      return {
        text: "Pending Invite",
        color: basicColors.gold,
      };
    }
    return {
      text: guard.status === "active" ? "Active" : "Inactive",
      color: guard.status === "active" ? themedColors.success : basicColors.gold,
    };
  };

  const mapToPersonItem = (guard: GuardEntry): PersonItemData => ({
    id: guard.id,
    name: guard.name,
    phone: guard.phone,
    photoUrl: guard.photo_url,
    badge: getStatusBadge(guard),
    additionalInfo:
      guard.type === "pending"
        ? "Waiting for guard to accept invite"
        : undefined,
  });

  const handleAddGuard = () => {
    router.push("/(manager)/screens/add-guard");
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <EmptyStateView
        title="No Security Guards"
        subtitle1={
          searchQuery || selectedFilter
            ? "Try adjusting your filters"
            : "Add security guards to manage gate access"
        }
        backgroundColor={themedColors.cardBackground}
        icon={<UsersIcon width={80} height={80} color={themedColors.accent} />}
      />
    </View>
  );

  const renderHeader = () => (
    <View className="px-4 mb-3 flex-row items-center">
      <View className="flex-1">
        <SearchBar
          prompt="Search guards..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <TouchableOpacity
        onPress={handleAddGuard}
        className="ml-3 w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: themedColors.accent }}
        activeOpacity={0.8}
      >
        <PlusIcon width={20} height={20} color={themedColors.textOnAccent} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={themedColors.accent} />
      </View>
    );
  }

  return (
    <Animated.View
      className="flex-1"
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      {renderHeader()}

      <FilterChips
        options={filterOptions}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        allLabel="All Guards"
      />

      <FlatList
        data={filteredGuards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PersonListItem person={mapToPersonItem(item)} type="guard" />
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchGuards(true)}
            tintColor={themedColors.accent}
          />
        }
      />
    </Animated.View>
  );
};

export default SecurityGuardsTab;
