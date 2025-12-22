import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { useResidence } from "@/contexts/residenceContext";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowIcon, MarkerFilledIcon, BuildingIcon } from "../icons";
import basicColors from "@/themes/colors";

interface SocietySwitcherProps {
  showChevron?: boolean;
  onPress?: () => void;
  textColor?: string;
}

const SocietySwitcher: React.FC<SocietySwitcherProps> = ({
  showChevron = true,
  onPress,
  textColor,
}) => {
  const { themedColors } = useTheme();
  const { currentResidence, hasMultipleResidences } = useResidence();

  if (!currentResidence) return null;

  const handlePress = () => {
    if (hasMultipleResidences && onPress) {
      onPress();
    }
  };

  const displayTextColor = textColor || themedColors.text;
  const secondaryTextColor = textColor
    ? textColor + "aa"
    : themedColors.secondaryText;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!hasMultipleResidences}
      activeOpacity={hasMultipleResidences ? 0.7 : 1}
      className="flex-row items-center"
    >
      <View>
        <View className="flex-row gap-x-2 items-center">
          <MarkerFilledIcon width={16} height={16} color={basicColors.red} />
          <ThemedText
            className="text-lg font-uber-move-medium tracking-wide"
            style={{ color: displayTextColor }}
          >
            {currentResidence.short_name || currentResidence.society?.name}
          </ThemedText>
          {hasMultipleResidences && showChevron && (
            <View className="ml-1 -rotate-90">
              <ArrowIcon width={14} height={14} stroke={displayTextColor} />
            </View>
          )}
        </View>
        <ThemedTextSecondary
          className="text-sm font-lato-regular -ml-1"
          style={{ color: secondaryTextColor }}
        >
          Society Manager
        </ThemedTextSecondary>
      </View>
    </TouchableOpacity>
  );
};

export interface SocietySwitcherSheetRef {
  open: () => void;
  close: () => void;
}

const getRoleDisplay = (role: string): string => {
  const roleMap: Record<string, string> = {
    manager: "Manager",
    admin: "Admin",
    owner: "Owner",
    adult: "Adult",
    kid: "Kid",
    tenant: "Tenant",
    staff: "Staff",
  };
  return roleMap[role] || role;
};

export const SocietySwitcherSheet = forwardRef<SocietySwitcherSheetRef>(
  (_, ref) => {
    const { themedColors } = useTheme();
    const {
      residences,
      currentResidence,
      hasMultipleResidences,
      setCurrentResidence,
    } = useResidence();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const insets = useSafeAreaInsets();

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    if (!hasMultipleResidences) return null;

    const handleSelectSociety = (residence: (typeof residences)[0]) => {
      setCurrentResidence(residence);
      bottomSheetRef.current?.close();
    };

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    );

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
        }}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView
          className="flex-1 pt-5"
          style={{ backgroundColor: themedColors.modal }}
        >
          <View className="px-6" style={{ paddingBottom: insets.bottom + 24 }}>
            <ThemedText className="text-xl font-uber-move-medium tracking-wide mb-6 mt-4">
              Switch Society
            </ThemedText>

            <View style={{ gap: 12 }}>
              {residences.map((residence) => {
                const isSelected = currentResidence?.id === residence.id;

                return (
                  <TouchableOpacity
                    key={residence.id}
                    onPress={() => handleSelectSociety(residence)}
                    className="p-4 rounded-lg border flex-row justify-between items-center"
                    style={{
                      backgroundColor: isSelected
                        ? themedColors.accent + "10"
                        : themedColors.cardBackground,
                      borderColor: isSelected
                        ? themedColors.accent
                        : themedColors.border,
                    }}
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: themedColors.accent + "20" }}
                      >
                        <BuildingIcon
                          width={20}
                          height={20}
                          color={themedColors.accent}
                        />
                      </View>
                      <View className="flex-1">
                        <ThemedText
                          className="text-base font-uber-move-medium tracking-wide"
                          style={{
                            color: isSelected
                              ? themedColors.accent
                              : themedColors.text,
                          }}
                        >
                          {residence.society?.name}
                        </ThemedText>
                        <ThemedTextSecondary className="text-sm font-lato-regular mt-0.5">
                          {getRoleDisplay(residence.userRole)}
                        </ThemedTextSecondary>
                      </View>
                    </View>

                    {isSelected && (
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{ backgroundColor: themedColors.accent }}
                      >
                        <ThemedText
                          className="text-xs font-bold"
                          style={{ color: "#fff" }}
                        >
                          ✓
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

export default SocietySwitcher;
