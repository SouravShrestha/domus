import React, { useRef } from "react";
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
import { ResidenceWithSociety } from "@/types/api/response/residence";

interface ResidenceSwitcherProps {
  showChevron?: boolean;
}

const ResidenceSwitcher: React.FC<ResidenceSwitcherProps> = ({
  showChevron = true,
}) => {
  const { themedColors } = useTheme();
  const {
    residences,
    currentResidence,
    hasMultipleResidences,
    setCurrentResidence,
  } = useResidence();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  if (!currentResidence) return null;

  const handlePress = () => {
    if (hasMultipleResidences) {
      bottomSheetRef.current?.expand();
    }
  };

  const handleSelectResidence = (residence: ResidenceWithSociety) => {
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
    <>
      <TouchableOpacity
        onPress={handlePress}
        disabled={!hasMultipleResidences}
        activeOpacity={hasMultipleResidences ? 0.7 : 1}
        className="flex-row items-center"
      >
        <View>
          <ThemedText className="text-lg font-uber-move-bold tracking-wide">
            {currentResidence.short_name}
          </ThemedText>
          <ThemedTextSecondary className="text-sm font-lato-regular">
            {currentResidence.society.name}
          </ThemedTextSecondary>
        </View>
        {hasMultipleResidences && showChevron && (
          <View className="ml-2">
            <ThemedText
              className="text-lg"
              style={{ color: themedColors.accent }}
            >
              ▼
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>

      {hasMultipleResidences && (
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
                Switch Residence
              </ThemedText>

              <View style={{ gap: 12 }}>
                {residences.map((residence) => {
                  const isSelected = currentResidence?.id === residence.id;

                  return (
                    <TouchableOpacity
                      key={residence.id}
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
                        <ThemedText
                          className="text-lg font-uber-move-medium tracking-wide"
                          style={{
                            color: isSelected
                              ? themedColors.accent
                              : themedColors.text,
                          }}
                        >
                          {residence.short_name}
                        </ThemedText>
                        <ThemedTextSecondary className="text-sm font-lato-regular mt-1">
                          {residence.society.name}
                        </ThemedTextSecondary>
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
      )}
    </>
  );
};

export default ResidenceSwitcher;
