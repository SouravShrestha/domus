import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import SearchBar from "@components/widgets/SearchBar";
import EmptyStateView from "@components/widgets/EmptyStateView";
import PersonListItem, { PersonItemData } from "./PersonListItem";
import FilterChips, { FilterOption } from "./FilterChips";
import { supabase_client } from "@/api/client";
import { showErrorToast } from "@/utils/toast";
import basicColors from "@/themes/colors";
import { UsersIcon } from "@/components/icons";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";

interface ResidentMember {
  id: string;
  user_id: string;
  role: string;
  name: string;
  phone: string;
  photo_url: string | null;
  residence_short_name: string;
  flat_number: string | null;
  block: string | null;
}

const filterOptions: FilterOption[] = [
  { key: "owner", label: "Owners" },
  { key: "family", label: "Family" },
  { key: "tenant", label: "Tenants" },
];

const ResidentsTab: React.FC = () => {
  const { themedColors } = useTheme();
  const { currentResidence } = useResidence();

  const [residents, setResidents] = useState<ResidentMember[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<ResidentMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const fetchResidents = useCallback(
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
        const { data, error } = await supabase_client
          .from("approved_residence_memberships")
          .select(
            `
            id,
            user_id,
            role,
            user:user_profiles!inner(
              name,
              phone,
              photo_url
            ),
            residence:residences!inner(
              short_name,
              flat_number,
              block,
              society_id
            )
          `
          )
          .eq("residence.society_id", currentResidence.society_id)
          .order("role", { ascending: true });

        if (error) {
          showErrorToast("Failed to load residents");
          return;
        }

        const mappedResidents: ResidentMember[] = (data || []).map(
          (item: any) => ({
            id: item.id,
            user_id: item.user_id,
            role: item.role,
            name: item.user?.name || "Unknown",
            phone: item.user?.phone || "",
            photo_url: item.user?.photo_url,
            residence_short_name: item.residence?.short_name || "",
            flat_number: item.residence?.flat_number,
            block: item.residence?.block,
          })
        );

        setResidents(mappedResidents);

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
        showErrorToast("Failed to load residents");
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
      fetchResidents();
    }, [fetchResidents])
  );

  useEffect(() => {
    let filtered = residents;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.phone.toLowerCase().includes(query) ||
          r.residence_short_name.toLowerCase().includes(query) ||
          r.flat_number?.toLowerCase().includes(query)
      );
    }

    if (selectedFilter) {
      filtered = filtered.filter((r) => r.role === selectedFilter);
    }

    setFilteredResidents(filtered);
  }, [residents, searchQuery, selectedFilter]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return themedColors.accent;
      case "family":
        return basicColors.gold;
      case "tenant":
        return themedColors.success;
      default:
        return themedColors.secondaryText;
    }
  };

  const mapToPersonItem = (resident: ResidentMember): PersonItemData => ({
    id: resident.id,
    name: resident.name,
    phone: resident.phone,
    photoUrl: resident.photo_url,
    subtitle: resident.residence_short_name,
    badge: {
      text: capitalizeFirstLetterOfWords(resident.role),
      color: getRoleBadgeColor(resident.role),
    },
    additionalInfo: resident.block
      ? `Block ${resident.block} • ${resident.flat_number}`
      : resident.flat_number || undefined,
  });

  const handleResidentPress = (person: PersonItemData) => {
    const resident = residents.find((r) => r.id === person.id);
    if (resident) {
      router.push(`/(manager)/residence-details/${resident.residence_short_name}`);
    }
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <EmptyStateView
        title="No Residents Found"
        subtitle1={
          searchQuery || selectedFilter
            ? "Try adjusting your filters"
            : "Residents will appear here"
        }
        backgroundColor={themedColors.cardBackground}
        icon={<UsersIcon width={80} height={80} color={themedColors.accent} />}
      />
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
      <View className="px-4 mb-3">
        <SearchBar
          prompt="Search residents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FilterChips
        options={filterOptions}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        allLabel="All Residents"
      />

      <FlatList
        data={filteredResidents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PersonListItem
            person={mapToPersonItem(item)}
            type="resident"
          />
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchResidents(true)}
            tintColor={themedColors.accent}
          />
        }
      />
    </Animated.View>
  );
};

export default ResidentsTab;
