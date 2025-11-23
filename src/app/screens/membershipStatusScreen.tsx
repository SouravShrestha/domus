import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StatusBar,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import {
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
} from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ThemedHeaderWithBack from "@components/widgets/ThemedHeaderWithBack";
import { ArrowIcon } from "@components/icons";
import { ResidenceWithMembershipStatus } from "@/types/api/response/residence";
import { getMyResidenceMemberships } from "@/api/residence.service";
import ResidenceSelectorBottomSheet, {
  ResidenceSelectorBottomSheetRef,
} from "@/components/widgets/ResidenceSelectorBottomSheet";
import StatusStepper from "@/components/widgets/StatusStepper";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import { showErrorToast } from "@/utils/toast";
import basicColors from "@/themes/colors";
import boyImage from "@/assets/images/not-found-boy.png";

const MembershipStatusScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomSheetRef = useRef<ResidenceSelectorBottomSheetRef>(null);

  const [residences, setResidences] = useState<ResidenceWithMembershipStatus[]>(
    []
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const selectedResidence = residences[selectedIndex] || null;

  const fetchMemberships = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMyResidenceMemberships();
      setResidences(data);

      if (selectedIndex >= data.length) {
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error("Error fetching memberships:", error);
      showErrorToast("Failed to load membership status");
    } finally {
      setIsLoading(false);
    }
  }, [selectedIndex]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const handleSelectResidence = useCallback(
    (residence: ResidenceWithMembershipStatus) => {
      const index = residences.findIndex(
        (r) => r.residence.id === residence.residence.id
      );
      if (index !== -1) {
        setSelectedIndex(index);
      }
      bottomSheetRef.current?.close();
    },
    [residences]
  );

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const borderColor =
    currentTheme === "dark" ? `${themedColors.border}30` : themedColors.border;

  if (isLoading) {
    return (
      <ThemedView className="flex-1 px-6">
        <StatusBar barStyle="default" animated />
        <View
          className="pb-2 -mx-3"
          style={{
            paddingTop: insets.top + 16,
          }}
        >
          <ThemedHeaderWithBack
            onBackPress={() => router.back()}
            title="Memberships"
          />
        </View>
        <LoadingOverlay currentTheme={currentTheme} withToast={false} />
      </ThemedView>
    );
  }

  if (residences.length === 0) {
    return (
      <ThemedView className="flex-1 px-6">
        <StatusBar barStyle="default" animated />
        <View
          className="pb-2 -mx-3"
          style={{
            paddingTop: insets.top + 16,
          }}
        >
          <ThemedHeaderWithBack
            onBackPress={() => router.back()}
            title="Memberships"
          />
        </View>
        <View className="flex-1 items-center justify-center px-6 absolute top-0 bottom-0 left-0 right-0">
          <View
            className="rounded-full w-56 h-56 overflow-hidden justify-center items-center"
            style={{ backgroundColor: basicColors.purple + "50" }}
          >
            <Image
              source={boyImage}
              style={{ width: 200, height: 200 }}
              contentFit="contain"
              className="absolute bottom-0"
              transition={300}
            />
          </View>
          <ThemedText className="text-lg font-uber-move-medium text-center mb-2 mt-6">
            No Membership Requests
          </ThemedText>
          <ThemedTextSecondary className="text-sm font-lato-regular text-center">
            You don't have any active membership requests at the moment
          </ThemedTextSecondary>
        </View>
      </ThemedView>
    );
  }

  const requestDate =
    selectedResidence?.membershipStatusHistory?.[0]?.statusSetAt;

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Header */}
        <View
          className="pb-2 -mx-3"
          style={{
            paddingTop: insets.top + 16,
          }}
        >
          <ThemedHeaderWithBack
            onBackPress={() => router.back()}
            title="Memberships"
          />
        </View>
        {/* Residence Selector */}
        <View className="pt-6">
          <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider mb-4">
            CHOOSE YOUR RESIDENCE
          </ThemedTextSecondary>

          <TouchableOpacity
            onPress={() => bottomSheetRef.current?.open()}
            className="p-4 rounded-lg border flex-row items-center justify-between"
            style={{
              backgroundColor: themedColors.cardBackground,
              borderColor: themedColors.border,
            }}
          >
            <View className="flex-1">
              <ThemedText className="text-base font-uber-move-medium tracking-wide">
                {selectedResidence.residence.shortName}
              </ThemedText>
              <ThemedTextSecondary className="text-sm font-lato-regular mt-0.5">
                {selectedResidence.society.name}
              </ThemedTextSecondary>
            </View>

            <View style={{ transform: [{ rotate: "-90deg" }] }}>
              <ArrowIcon width={20} height={20} stroke={themedColors.text} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Status Stepper */}
        <View className="mt-4">
          <StatusStepper
            statusHistory={selectedResidence.membershipStatusHistory || []}
            currentStatus={selectedResidence.membershipStatus}
          />
        </View>

        {/* Membership Details */}
        <View className="mt-0">
          <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider mb-4 mt-2">
            MEMBERSHIP DETAILS
          </ThemedTextSecondary>

          <View
            className="rounded-lg overflow-hidden border"
            style={{
              backgroundColor: themedColors.cardBackground,
              borderColor: borderColor,
            }}
          >
            <DetailRow
              label="Residence"
              value={selectedResidence.residence.shortName}
              borderColor={borderColor}
            />
            <DetailRow
              label="Society"
              value={selectedResidence.society.name}
              borderColor={borderColor}
            />
            <DetailRow
              label="Status"
              value={capitalizeFirstLetterOfWords(
                selectedResidence.membershipStatus
              )}
              valueColor={themedColors.accent}
              valueBold
              borderColor={borderColor}
            />
            {requestDate && (
              <DetailRow
                label="Requested On"
                value={formatDate(requestDate)}
                showBorder={false}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Residence Selector Bottom Sheet */}
      <ResidenceSelectorBottomSheet
        ref={bottomSheetRef}
        residences={residences}
        selectedResidenceId={selectedResidence.residence.id}
        onSelect={handleSelectResidence}
      />
    </ThemedView>
  );
};

// Helper component for detail rows
const DetailRow: React.FC<{
  label: string;
  value: string;
  valueColor?: string;
  valueBold?: boolean;
  borderColor?: string;
  showBorder?: boolean;
}> = ({
  label,
  value,
  valueColor,
  valueBold = false,
  borderColor,
  showBorder = true,
}) => (
  <View
    className="flex-row items-center justify-between py-3 px-4"
    style={{
      borderBottomWidth: showBorder ? 1 : 0,
      borderBottomColor: borderColor,
    }}
  >
    <ThemedTextSecondary className="text-xs font-lato-medium uppercase tracking-wider flex-1">
      {label}
    </ThemedTextSecondary>
    <ThemedText
      className={`text-base ${
        valueBold ? "font-lato-bold" : "font-lato-regular"
      } flex-1 text-right`}
      style={valueColor ? { color: valueColor } : undefined}
    >
      {value}
    </ThemedText>
  </View>
);

export default MembershipStatusScreen;
