import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import EmptyStateView from "@components/widgets/EmptyStateView";
import LoadingOverlay from "@components/widgets/LoadingOverlay";
import PersonListItem, { PersonItemData } from "./PersonListItem";
import FilterChips, { FilterOption } from "./FilterChips";
import { getSocietyGuestLogs } from "@/api/services/visitor.service";
import { getSocietyWalkInLogs } from "@/api/services/walkInVisitor.service";
import { showErrorToast } from "@/utils/toast";
import basicColors from "@/themes/colors";
import { UsersIcon } from "@/components/icons";

interface VisitorEntry {
  id: string;
  visitor_name: string;
  visitor_phone: string | null;
  purpose: string | null;
  entry_time: string | null;
  exit_time: string | null;
  status?: string;
  type: "invited" | "walk_in" | "staff";
  residence_short_name?: string;
}

interface VisitorsTabProps {
  isActive: boolean;
}

const filterOptions: FilterOption[] = [
  { key: "invited", label: "Invited" },
  { key: "walk_in", label: "Walk-in" },
  { key: "inside", label: "Currently Inside" },
  { key: "exited", label: "Exited" },
];

const VisitorsTab: React.FC<VisitorsTabProps> = ({ isActive }) => {
  const { themedColors, currentTheme } = useTheme();
  const { currentResidence } = useResidence();

  const [visitors, setVisitors] = useState<VisitorEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);

  const fetchVisitors = useCallback(
    async (isRefresh = false) => {
      if (!currentResidence?.society_id) return;

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const [invitedResult, walkInResult] = await Promise.all([
          getSocietyGuestLogs(currentResidence.society_id, 100),
          getSocietyWalkInLogs(currentResidence.society_id, 100),
        ]);

        const allVisitors: VisitorEntry[] = [];

        if (invitedResult.data) {
          for (const log of invitedResult.data as any[]) {
            allVisitors.push({
              id: log.id,
              visitor_name: log.guest_invitation?.visitor_name || "Unknown",
              visitor_phone: log.guest_invitation?.visitor_phone,
              purpose: log.guest_invitation?.purpose,
              entry_time: log.entry_time,
              exit_time: log.exit_time,
              status: log.exit_time ? "exited" : "inside",
              type: "invited",
              residence_short_name: log.guest_invitation?.residence?.short_name,
            });
          }
        }

        if (walkInResult.data) {
          for (const log of walkInResult.data as any[]) {
            allVisitors.push({
              id: log.id,
              visitor_name: log.visitor_name,
              visitor_phone: log.visitor_phone,
              purpose: log.purpose,
              entry_time: log.entry_time,
              exit_time: log.exit_time,
              status: log.exit_time ? "exited" : "inside",
              type: "walk_in",
              residence_short_name: log.residence?.short_name,
            });
          }
        }

        allVisitors.sort((a, b) => {
          const timeA = a.entry_time ? new Date(a.entry_time).getTime() : 0;
          const timeB = b.entry_time ? new Date(b.entry_time).getTime() : 0;
          return timeB - timeA;
        });

        setVisitors(allVisitors);
        hasLoadedRef.current = true;
      } catch (error) {
        showErrorToast("Failed to load visitors");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentResidence?.society_id]
  );

  useEffect(() => {
    if (isActive && !hasLoadedRef.current) {
      fetchVisitors();
    }
  }, [isActive, fetchVisitors]);

  const filteredVisitors = useMemo(() => {
    let filtered = visitors;

    if (selectedFilter) {
      switch (selectedFilter) {
        case "invited":
          filtered = filtered.filter((v) => v.type === "invited");
          break;
        case "walk_in":
          filtered = filtered.filter((v) => v.type === "walk_in");
          break;
        case "inside":
          filtered = filtered.filter((v) => v.status === "inside");
          break;
        case "exited":
          filtered = filtered.filter((v) => v.status === "exited");
          break;
      }
    }

    return filtered;
  }, [visitors, selectedFilter]);

  const formatTimestamp = useCallback((timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString([], { day: "numeric", month: "short" });
    }
  }, []);

  const mapToPersonItem = useCallback(
    (visitor: VisitorEntry): PersonItemData => ({
      id: visitor.id,
      name: visitor.visitor_name,
      phone: visitor.visitor_phone,
      subtitle: visitor.residence_short_name,
      badge: {
        text: visitor.status === "inside" ? "Inside" : "Exited",
        color:
          visitor.status === "inside" ? themedColors.success : basicColors.gold,
      },
      additionalInfo: visitor.entry_time
        ? `${visitor.type === "invited" ? "Invited" : "Walk-in"} • ${formatTimestamp(visitor.entry_time)}`
        : undefined,
    }),
    [themedColors.success, formatTimestamp]
  );

  const renderEmptyState = useCallback(
    () => (
      <View className="flex-1 items-center justify-center py-20">
        <EmptyStateView
          title="No Visitors Found"
          subtitle1={
            selectedFilter
              ? "Try adjusting your filters"
              : "Visitor logs will appear here"
          }
          backgroundColor={themedColors.cardBackground}
          icon={<UsersIcon width={80} height={80} color={themedColors.accent} />}
        />
      </View>
    ),
    [selectedFilter, themedColors.cardBackground, themedColors.accent]
  );

  const handleRefresh = useCallback(() => {
    fetchVisitors(true);
  }, [fetchVisitors]);

  return (
    <View className="flex-1">
      {isLoading && <LoadingOverlay currentTheme={currentTheme} />}
      <View className="flex-1">
        <FilterChips
          options={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          allLabel="All Visitors"
        />

        <FlatList
          data={filteredVisitors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PersonListItem person={mapToPersonItem(item)} type="visitor" />
          )}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={themedColors.accent}
            />
          }
        />
      </View>
    </View>
  );
};

export default VisitorsTab;
