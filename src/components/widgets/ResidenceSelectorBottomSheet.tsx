import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
} from "react";
import { TouchableOpacity, View } from "react-native";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResidenceWithMembershipStatus } from "@/types/api/response/residence";

interface ResidenceSelectorBottomSheetProps {
    residences: ResidenceWithMembershipStatus[];
    selectedResidenceId: string | null;
    onSelect: (residence: ResidenceWithMembershipStatus) => void;
}

export interface ResidenceSelectorBottomSheetRef {
    open: () => void;
    close: () => void;
}

const ResidenceSelectorBottomSheet = forwardRef<
    ResidenceSelectorBottomSheetRef,
    ResidenceSelectorBottomSheetProps
>(({ residences, selectedResidenceId, onSelect }, ref) => {
    const { themedColors } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);

    useImperativeHandle(ref, () => ({
        open: () => bottomSheetRef.current?.expand(),
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

    const handleSelectResidence = (residence: ResidenceWithMembershipStatus) => {
        onSelect(residence);
        bottomSheetRef.current?.close();
    };

    // Get status badge color
    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case "approved":
                return "#26C281";
            case "verified":
                return "#22A7F0";
            case "requested":
            case "pending":
                return "#F9690E";
            case "rejected":
                return "#C91F37";
            default:
                return themedColors.disabled;
        }
    };

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
              Select residence
            </ThemedText>

            {residences.length === 0 && (
              <ThemedTextSecondary className="text-sm font-lato-regular text-center py-8">
                No residence memberships found
              </ThemedTextSecondary>
            )}

            <View style={{ gap: 12 }}>
              {residences.map((residence) => {
                const isSelected =
                  selectedResidenceId === residence.residence.id;
                const statusColor = getStatusColor(residence.membershipStatus);

                return (
                  <TouchableOpacity
                    key={residence.residence.id}
                    onPress={() => handleSelectResidence(residence)}
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
                    <View>
                      {/* Residence short name */}
                      <ThemedText
                        className="text-lg font-uber-move-medium tracking-wide"
                        style={{
                          color: isSelected
                            ? themedColors.accent
                            : themedColors.text,
                        }}
                      >
                        {residence.residence.shortName}
                      </ThemedText>

                      {/* Society name */}
                      <ThemedTextSecondary className="text-sm font-lato-regular mt-1">
                        {residence.society.name}
                      </ThemedTextSecondary>
                    </View>

                    {/* Status badge */}
                    <View
                      className="self-start px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: statusColor + "20",
                      }}
                    >
                      <ThemedText
                        className="text-xs font-lato-bold uppercase tracking-wide"
                        style={{ color: statusColor }}
                      >
                        {residence.membershipStatus}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
});

ResidenceSelectorBottomSheet.displayName = "ResidenceSelectorBottomSheet";

export default ResidenceSelectorBottomSheet;
