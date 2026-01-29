import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResidenceWithOccupancy } from "@/types/api/response/residence";
import { residenceRepository } from "@/api/repositories/residence/residence.repository";
import basicColors from "@/themes/colors";
import {
  KeyIcon,
  UsersIcon,
  HoldingHandKeyIcon,
  FilledHeartIcon,
} from "@/components/icons";
import { router } from "expo-router";
import { ROUTES } from "@/constants/routes";

export interface ResidenceDetailsBottomSheetRef {
  open: (residence: ResidenceWithOccupancy) => void;
  close: () => void;
}

type MemberDetails = {
  ownerCount: number;
  familyCount: number;
  tenantCount: number;
};

const SkeletonBox: React.FC<{
  width: number | string;
  height: number;
  style?: object;
}> = ({ width, height, style }) => {
  const { themedColors } = useTheme();
  const animatedValueRef = useRef(new Animated.Value(0.3));

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValueRef.current, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValueRef.current, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: themedColors.border,
          borderRadius: 4,
          // eslint-disable-next-line react-hooks/refs
          opacity: animatedValueRef.current,
        },
        style,
      ]}
    />
  );
};

const SkeletonCard: React.FC<{ isLarge?: boolean }> = ({ isLarge }) => {
  const { themedColors } = useTheme();

  return (
    <View
      className={
        isLarge
          ? "rounded-xl p-4 items-center gap-y-2"
          : "flex-1 rounded-xl p-4 items-center gap-y-2.5"
      }
      style={{ backgroundColor: themedColors.cardBackground }}
    >
      <SkeletonBox width={16} height={16} />
      <SkeletonBox width={60} height={12} />
      <SkeletonBox width={isLarge ? 140 : 40} height={16} />
      {isLarge && (
        <SkeletonBox width={100} height={14} style={{ marginTop: 8 }} />
      )}
    </View>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  valueColor?: string;
}> = ({ icon, label, value, valueColor }) => {
  const { themedColors } = useTheme();

  return (
    <View
      className="flex-1 rounded-md p-4 items-center gap-y-2.5 my-1"
      style={{ backgroundColor: themedColors.cardBackground }}
    >
      {icon}
      <Text
        className="text-xs font-uber-move-medium uppercase tracking-wider"
        style={{ color: themedColors.secondaryText }}
      >
        {label}
      </Text>
      <ThemedText
        className="text-xl font-uber-move-medium"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </ThemedText>
    </View>
  );
};

const ResidenceDetailsBottomSheet = forwardRef<
  ResidenceDetailsBottomSheetRef,
  object
>((_, ref) => {
  const { themedColors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [residence, setResidence] = useState<ResidenceWithOccupancy | null>(
    null,
  );
  const [memberDetails, setMemberDetails] = useState<MemberDetails | null>(
    null,
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchMemberDetails = async (residenceId: string) => {
    setIsLoadingDetails(true);
    try {
      const { data, error } =
        await residenceRepository.findMembersByResidenceId(residenceId);

      if (error || !data) {
        setMemberDetails({
          ownerCount: 0,
          familyCount: 0,
          tenantCount: 0,
        });
        return;
      }

      const approvedMembers = data.approved || [];
      const ownerCount = approvedMembers.filter(
        (m) => m.role?.toLowerCase() === "owner",
      ).length;
      const familyCount = approvedMembers.filter(
        (m) =>
          m.role?.toLowerCase() === "adult" ||
          m.role?.toLowerCase() === "child",
      ).length;
      const tenantCount = approvedMembers.filter(
        (m) => m.role?.toLowerCase() === "tenant",
      ).length;

      setMemberDetails({
        ownerCount,
        familyCount,
        tenantCount,
      });
    } catch {
      setMemberDetails({
        ownerCount: 0,
        familyCount: 0,
        tenantCount: 0,
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useImperativeHandle(ref, () => ({
    open: (selectedResidence: ResidenceWithOccupancy) => {
      setResidence(selectedResidence);
      setMemberDetails(null);
      fetchMemberDetails(selectedResidence.id);
      setTimeout(() => {
        bottomSheetRef.current?.expand();
      }, 50);
    },
    close: () => bottomSheetRef.current?.close(),
  }));

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      opacity={0.5}
    />
  );

  const handleManageOwners = () => {
    if (!residence) return;
    bottomSheetRef.current?.close();
    router.push({
      pathname: ROUTES.MANAGER.SCREENS.RESIDENCES.MANAGE_OWNERS as any,
      params: {
        residenceId: residence.id,
        residenceName: residence.short_name || residence.flat_number,
        block: residence.block || "N/A",
        floorNumber: String(residence.floor_number ?? 0),
      },
    });
  };

  if (!residence) return null;

  const isOccupied = residence.is_occupied;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: themedColors.modal,
      }}
      handleIndicatorStyle={{
        backgroundColor: themedColors.accent,
        width: 32,
      }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView
        className="flex-1 pt-2"
        style={{ backgroundColor: themedColors.modal }}
      >
        <View
          className="px-6 pt-4"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-1">
            <ThemedText className="text-2xl font-uber-move-medium tracking-wide">
              {residence.short_name || residence.flat_number}
            </ThemedText>
            <View
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor: isOccupied
                  ? basicColors.brightGreen + "20"
                  : themedColors.lightBorder,
              }}
            >
              <Text
                className="text-xs font-uber-move-medium"
                style={{
                  color: isOccupied
                    ? basicColors.brightGreen
                    : themedColors.secondaryText,
                }}
              >
                {isOccupied ? "Occupied" : "Vacant"}
              </Text>
            </View>
          </View>

          {/* Location */}
          <Text
            className="text-base font-uber-move-regular mb-6"
            style={{ color: themedColors.secondaryText }}
          >
            Block {residence.block || "N/A"} • Floor{" "}
            {residence.floor_number ?? 0}
          </Text>

          {/* Stats Grid */}
          {isLoadingDetails ? (
            <View className="flex-row" style={{ gap: 12 }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <View className="flex-row" style={{ gap: 12 }}>
              <StatCard
                icon={
                  <KeyIcon width={16} height={16} color={basicColors.gold} />
                }
                label="Owners"
                value={memberDetails?.ownerCount ?? 0}
              />
              <StatCard
                icon={
                  <FilledHeartIcon
                    width={16}
                    height={16}
                    color={basicColors.blue}
                  />
                }
                label="Family"
                value={memberDetails?.familyCount ?? 0}
              />
              <StatCard
                icon={
                  <HoldingHandKeyIcon
                    width={16}
                    height={16}
                    color={basicColors.lightPink}
                  />
                }
                label="Tenants"
                value={memberDetails?.tenantCount ?? 0}
              />
            </View>
          )}

          {/* Manage Owners Button */}
          {!isLoadingDetails && (
            <TouchableOpacity
              onPress={handleManageOwners}
              className="flex-row items-center justify-center py-4 rounded-md mt-6"
              style={{ backgroundColor: themedColors.buttonBackground }}
              activeOpacity={0.8}
            >
              <ThemedText
                className="font-uber-move-medium text-base tracking-wide"
                style={{ color: themedColors.buttonText }}
              >
                Manage Owners
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

ResidenceDetailsBottomSheet.displayName = "ResidenceDetailsBottomSheet";

export default ResidenceDetailsBottomSheet;
