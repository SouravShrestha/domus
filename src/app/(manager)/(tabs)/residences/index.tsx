import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView, ThemedText } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useResidence } from "@contexts/residenceContext";
import { residenceRepository } from "@repositories/residence/residence.repository";
import { ResidenceWithOccupancy } from "@/types/api/response/residence";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import {
  MarkerFilledIcon,
  TotalResidencesIcon,
  ChevronDownIcon,
} from "@/components/icons";
import basicColors from "@/themes/colors";
import Divider from "@/components/widgets/Divider";
import FilterSortBar, {
  SortOption,
  FilterCategory,
} from "@/components/widgets/FilterSortBar";
import ResidenceDetailsBottomSheet, {
  ResidenceDetailsBottomSheetRef,
} from "@/app/(manager)/screens/residences/ResidenceDetailsBottomSheet";
import { Portal } from "@gorhom/portal";

type ResidencesByBlock = {
  [block: string]: {
    [floor: number]: ResidenceWithOccupancy[];
  };
};

const SORT_OPTIONS: SortOption[] = [
  {
    label: "Block (A-Z)",
    value: "block_asc",
    isDefault: true,
    shortLabel: "Block A-Z",
  },
  { label: "Block (Z-A)", value: "block_desc", shortLabel: "Block Z-A" },
];

const ResidenceCard: React.FC<{
  residence: ResidenceWithOccupancy;
  onPress: () => void;
}> = ({ residence, onPress }) => {
  const { themedColors } = useTheme();
  const statusColor = residence.is_occupied
    ? basicColors.brightGreen
    : basicColors.gray;
  const size = 80;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="rounded-lg mr-3 items-center justify-center border"
      style={{
        height: size,
        width: size,
        borderColor: themedColors.lightBorder,
        backgroundColor: themedColors.cardBackground,
      }}
    >
      <View
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: statusColor }}
      />
      <ThemedText className="text-base font-uber-move-medium mt-2 tracking-wider">
        {residence.short_name || residence.flat_number}
      </ThemedText>
    </TouchableOpacity>
  );
};

const FloorSection: React.FC<{
  floor: number;
  residences: ResidenceWithOccupancy[];
  onResidencePress: (residence: ResidenceWithOccupancy) => void;
}> = ({ floor, residences, onResidencePress }) => {
  const { themedColors } = useTheme();

  return (
    <View className="mb-6 -mx-6">
      <View className="flex-row items-center justify-between mb-3 mx-6">
        <ThemedText className="text-base font-uber-move-medium tracking-wider">
          Floor {floor}
        </ThemedText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }}
      >
        {residences.map((residence) => (
          <ResidenceCard
            key={residence.id}
            residence={residence}
            onPress={() => onResidencePress(residence)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const BlockSection: React.FC<{
  block: string;
  floorData: { [floor: number]: ResidenceWithOccupancy[] };
  onResidencePress: (residence: ResidenceWithOccupancy) => void;
}> = ({ block, floorData, onResidencePress }) => {
  const { themedColors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  // eslint-disable-next-line react-hooks/refs
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim]);

  // eslint-disable-next-line react-hooks/refs
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-180deg"],
  });

  const totalUnits = Object.values(floorData).reduce(
    (sum, residences) => sum + residences.length,
    0,
  );

  const floors = Object.keys(floorData)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <View className="mb-3">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between mb-3 pb-3"
        activeOpacity={0.7}
      >
        <View>
          <ThemedText className="text-lg font-uber-move-medium tracking-wider">
            Block {block}
          </ThemedText>
          <Text
            className="text-sm font-uber-move-regular"
            style={{ color: themedColors.secondaryText }}
          >
            {totalUnits} {totalUnits === 1 ? "unit" : "units"}
          </Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDownIcon width={20} height={20} color={themedColors.text} />
        </Animated.View>
      </TouchableOpacity>
      {isExpanded && (
        <View>
          {floors.map((floor) => (
            <FloorSection
              key={floor}
              floor={floor}
              residences={floorData[floor]}
              onResidencePress={onResidencePress}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const ManagerResidencesScreen: React.FC = () => {
  const { currentTheme, themedColors } = useTheme();
  const { currentResidence } = useResidence();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<ResidenceDetailsBottomSheetRef>(null);

  const [residencesByBlock, setResidencesByBlock] = useState<ResidencesByBlock>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [allResidences, setAllResidences] = useState<ResidenceWithOccupancy[]>(
    [],
  );
  const [selectedSort, setSelectedSort] = useState<SortOption>(SORT_OPTIONS[0]);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});

  const societyId = currentResidence?.society_id;

  const filterCategories = useMemo<FilterCategory[]>(() => {
    const blocks = Array.from(
      new Set(allResidences.map((r) => r.block || "Default")),
    );
    const floors = Array.from(
      new Set(allResidences.map((r) => r.floor_number ?? 0)),
    );

    const blockCounts = blocks.reduce(
      (acc, block) => {
        acc[block] = allResidences.filter(
          (r) => (r.block || "Default") === block,
        ).length;
        return acc;
      },
      {} as Record<string, number>,
    );

    const floorCounts = floors.reduce(
      (acc, floor) => {
        acc[floor] = allResidences.filter(
          (r) => (r.floor_number ?? 0) === floor,
        ).length;
        return acc;
      },
      {} as Record<number, number>,
    );

    const occupiedCount = allResidences.filter((r) => r.is_occupied).length;
    const vacantCount = allResidences.filter((r) => !r.is_occupied).length;

    return [
      {
        id: "status",
        label: "Status",
        options: [
          { label: "Occupied", value: "occupied", count: occupiedCount },
          { label: "Vacant", value: "vacant", count: vacantCount },
        ],
      },
      {
        id: "block",
        label: "Block",
        options: blocks.sort().map((block) => ({
          label: block,
          value: block,
          count: blockCounts[block],
        })),
      },
      {
        id: "floor",
        label: "Floor",
        options: floors
          .sort((a, b) => a - b)
          .map((floor) => ({
            label: `Floor ${floor}`,
            value: floor.toString(),
            count: floorCounts[floor],
          })),
      },
    ];
  }, [allResidences]);

  const filteredResidences = useMemo(() => {
    let result = [...allResidences];

    const blockFilters = selectedFilters.block || [];
    const floorFilters = selectedFilters.floor || [];
    const statusFilters = selectedFilters.status || [];

    if (blockFilters.length > 0) {
      result = result.filter((r) =>
        blockFilters.includes(r.block || "Default"),
      );
    }

    if (floorFilters.length > 0) {
      result = result.filter((r) =>
        floorFilters.includes((r.floor_number ?? 0).toString()),
      );
    }

    if (statusFilters.length > 0) {
      result = result.filter((r) => {
        if (statusFilters.includes("occupied") && r.is_occupied) return true;
        if (statusFilters.includes("vacant") && !r.is_occupied) return true;
        return false;
      });
    }

    if (selectedSort.value === "block_desc") {
      result.sort((a, b) =>
        (b.block || "Default").localeCompare(a.block || "Default"),
      );
    } else {
      result.sort((a, b) =>
        (a.block || "Default").localeCompare(b.block || "Default"),
      );
    }

    return result;
  }, [allResidences, selectedFilters, selectedSort]);

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

  const groupResidences = (
    residences: ResidenceWithOccupancy[],
  ): ResidencesByBlock => {
    const grouped: ResidencesByBlock = {};

    residences.forEach((residence) => {
      const block = residence.block || "Default";
      const floor = residence.floor_number ?? 0;

      if (!grouped[block]) {
        grouped[block] = {};
      }
      if (!grouped[block][floor]) {
        grouped[block][floor] = [];
      }
      grouped[block][floor].push(residence);
    });

    Object.keys(grouped).forEach((block) => {
      Object.keys(grouped[block]).forEach((floorKey) => {
        const floor = Number(floorKey);
        grouped[block][floor].sort((a, b) =>
          a.flat_number.localeCompare(b.flat_number, undefined, {
            numeric: true,
          }),
        );
      });
    });

    return grouped;
  };

  const fetchResidences = useCallback(
    async (showRefresh = false) => {
      if (!societyId) return;

      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const { data, error } =
          await residenceRepository.findAllBySocietyId(societyId);

        if (error) {
          console.error("Error fetching residences:", error);
          setResidencesByBlock({});
          setAllResidences([]);
          setTotalCount(0);
        } else if (data) {
          setAllResidences(data);
          setTotalCount(data.length);
        }
      } catch (error) {
        console.error("Error fetching residences:", error);
        setResidencesByBlock({});
        setAllResidences([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [societyId],
  );

  useEffect(() => {
    fetchResidences();
  }, [fetchResidences]);

  const handleRefresh = () => {
    fetchResidences(true);
  };

  const handleResidencePress = (residence: ResidenceWithOccupancy) => {
    bottomSheetRef.current?.open(residence);
  };

  useEffect(() => {
    const grouped = groupResidences(filteredResidences);
    setResidencesByBlock(grouped);
  }, [filteredResidences]);

  if (isLoading) {
    return (
      <ThemedView className="flex-1">
        <LoadingOverlay currentTheme={currentTheme} />
      </ThemedView>
    );
  }

  const blocks = Object.keys(residencesByBlock).sort((a, b) =>
    selectedSort.value === "block_desc"
      ? b.localeCompare(a)
      : a.localeCompare(b),
  );

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <ScrollView
        className="flex-1"
        style={{ marginTop: insets.top }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={themedColors.accent}
          />
        }
      >
        <View className="flex-row gap-x-2 items-center px-6 py-3 mb-1">
          <MarkerFilledIcon width={16} height={16} color={basicColors.red} />
          <ThemedText className="text-lg font-uber-move-medium tracking-wide">
            {currentResidence.short_name || currentResidence.society?.name}
          </ThemedText>
        </View>

        <View className="mt-3 mb-8 -mx-6 px-4">
          <FilterSortBar
            sortOptions={SORT_OPTIONS}
            selectedSort={selectedSort}
            onSortChange={(value) => {
              const option = SORT_OPTIONS.find((o) => o.value === value);
              if (option) setSelectedSort(option);
            }}
            filterCategories={filterCategories}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearAllFilters={handleClearAllFilters}
            showResultCount={false}
            resultCount={filteredResidences.length}
            resultLabel="Residence"
          />
        </View>

        <View className="px-6 pb-8">
          {blocks.length > 0 ? (
            blocks.map((block, index) => (
              <View key={block} className="mb-8">
                <BlockSection
                  key={block}
                  block={block}
                  floorData={residencesByBlock[block]}
                  onResidencePress={handleResidencePress}
                />
                {index < blocks.length - 1 && <Divider key={index} />}
              </View>
            ))
          ) : (
            <View className="items-center py-12"></View>
          )}
        </View>
      </ScrollView>
      <Portal hostName="global">
        <ResidenceDetailsBottomSheet ref={bottomSheetRef} />
      </Portal>
    </ThemedView>
  );
};

export default ManagerResidencesScreen;
