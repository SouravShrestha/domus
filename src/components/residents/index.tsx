import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ThemedView,
  ThemedText,
  ThemedStatusBar,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useAuth } from "@contexts/authContext";
import { getManagerSocieties } from "@api/services/manager.service";
import { residenceRepository } from "@api/repositories/residence/residence.repository";
import { ResidenceWithOccupancy } from "@/types/api/response/residence";
import ResidenceCard from "@components/widgets/ResidenceCard";
import BlockSelectorBottomSheet, {
  BlockSelectorBottomSheetRef,
} from "@components/widgets/BlockSelectorBottomSheet";
import ChevronDownIcon from "@components/icons/ChevronDownIcon";

type ResidenceSection = {
  title: string;
  floor: number;
  data: ResidenceWithOccupancy[];
};

const ManagerResidencesScreen: React.FC = () => {
  const { themedColors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const blockSelectorRef = useRef<BlockSelectorBottomSheetRef>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [allResidences, setAllResidences] = useState<ResidenceWithOccupancy[]>(
    []
  );
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [sections, setSections] = useState<ResidenceSection[]>([]);

  // Fetch manager's society
  useEffect(() => {
    const fetchSociety = async () => {
      if (!user?.id) return;

      const { data, error } = await getManagerSocieties(user.id);
      if (error || !data || data.length === 0) {
        console.error("Failed to fetch manager societies:", error);
        setIsLoading(false);
        return;
      }

      // Assuming manager manages one society for now
      const society = data[0].society;
      if (society && "id" in society) {
        setSocietyId(society.id);
      }
    };

    fetchSociety();
  }, [user?.id]);

  // Fetch all residences for the society
  useEffect(() => {
    const fetchResidences = async () => {
      if (!societyId) return;

      setIsLoading(true);
      const { data, error } = await residenceRepository.findAllBySocietyId(
        societyId
      );

      if (error || !data) {
        console.error("Failed to fetch residences:", error);
        setIsLoading(false);
        return;
      }

      setAllResidences(data);

      // Extract unique blocks and sort alphabetically
      const blocks = Array.from(
        new Set(data.map((r) => r.block).filter((b): b is string => b !== null))
      ).sort();

      setAvailableBlocks(blocks);

      // Set first block as default
      if (blocks.length > 0 && !selectedBlock) {
        setSelectedBlock(blocks[0]);
      }

      setIsLoading(false);
    };

    fetchResidences();
  }, [societyId]);

  // Group residences by floor when block changes
  useEffect(() => {
    if (!selectedBlock) {
      setSections([]);
      return;
    }

    const filtered = allResidences.filter((r) => r.block === selectedBlock);

    // Group by floor
    const floorMap = new Map<number, ResidenceWithOccupancy[]>();
    filtered.forEach((residence) => {
      const floor = residence.floor_number ?? 0;
      if (!floorMap.has(floor)) {
        floorMap.set(floor, []);
      }
      floorMap.get(floor)!.push(residence);
    });

    // Convert to sections and sort by floor
    const newSections: ResidenceSection[] = Array.from(floorMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([floor, residences]) => ({
        title: `Floor ${floor}`,
        floor,
        data: residences,
      }));

    setSections(newSections);
  }, [selectedBlock, allResidences]);

  const handleResidencePress = (residence: ResidenceWithOccupancy) => {
    router.push(`/(manager)/residence-details/${residence.id}`);
  };

  const handleBlockSelect = (block: string) => {
    setSelectedBlock(block);
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <ThemedText className="text-lg font-uber-move-medium mb-2">
        No Residences Yet
      </ThemedText>
      <Text
        className="text-sm font-lato-regular text-center"
        style={{ color: themedColors.secondaryText }}
      >
        Residences will appear here once added
      </Text>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: ResidenceSection }) => (
    <View
      className="px-4 py-2 mb-2"
      style={{ backgroundColor: themedColors.background }}
    >
      <ThemedText className="text-base font-uber-move-medium">
        {section.title}
      </ThemedText>
    </View>
  );

  const renderResidenceItem = ({ item }: { item: ResidenceWithOccupancy }) => (
    <View className="px-4">
      <ResidenceCard residence={item} onPress={handleResidencePress} />
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ThemedStatusBar />
        <ActivityIndicator size="large" color={themedColors.accent} />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <ThemedStatusBar />
      <SafeAreaView className="flex-1">
        <View className="px-4 py-3">
          <ThemedText className="text-2xl font-uber-move-medium">
            Residences
          </ThemedText>
          <Text
            className="text-sm font-lato-regular mt-1"
            style={{ color: themedColors.secondaryText }}
          >
            {allResidences.length} total residences
          </Text>
        </View>

        {/* Block Selector */}
        {availableBlocks.length > 0 && (
          <View className="px-4 mb-3">
            <TouchableOpacity
              onPress={() => blockSelectorRef.current?.open()}
              className="flex-row items-center justify-between p-3 rounded-lg"
              style={{
                backgroundColor: themedColors.card,
                borderWidth: 1,
                borderColor: themedColors.border,
              }}
              activeOpacity={0.7}
            >
              <View>
                <Text
                  className="text-xs font-lato-regular mb-1"
                  style={{ color: themedColors.secondaryText }}
                >
                  Selected Block
                </Text>
                <ThemedText className="text-base font-uber-move-medium">
                  {selectedBlock || "Select a block"}
                </ThemedText>
              </View>
              <ChevronDownIcon
                width={20}
                height={20}
                color={themedColors.secondaryText}
              />
            </TouchableOpacity>
          </View>
        )}

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderResidenceItem}
          renderSectionHeader={renderSectionHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          stickySectionHeadersEnabled={false}
        />

        <BlockSelectorBottomSheet
          ref={blockSelectorRef}
          blocks={availableBlocks}
          selectedBlock={selectedBlock}
          onSelect={handleBlockSelect}
        />
      </SafeAreaView>
    </ThemedView>
  );
};

export default ManagerResidencesScreen;
