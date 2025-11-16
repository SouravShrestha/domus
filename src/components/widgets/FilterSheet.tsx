import React, { useCallback, useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { ThemedText } from "@themes/themedComponents";
import { ArrowIcon } from "@components/icons";
import { useTheme } from "@/contexts/themeContext";
import colorMapping from "@utils/themeColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";

interface FilterSheetProps {
  label: string;
  selectedItem: string | null;
  items: string[];
  onSelect: (item: string | null) => void;
  type: string;
  portalHostName?: string;
}

const FilterSheet: React.FC<FilterSheetProps> = ({
  label,
  selectedItem,
  items,
  onSelect,
  type = "all",
  portalHostName,
}) => {
  const { themedColors } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const toggleBottomSheet = useCallback((expand: boolean) => {
    if (expand) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    []
  );

  const handleSelect = useCallback(
    (item: string | null) => {
      onSelect(item);
      toggleBottomSheet(false);
    },
    [onSelect, toggleBottomSheet]
  );

  return (
    <>
      <TouchableOpacity
        onPress={() => toggleBottomSheet(true)}
        className="flex-row items-center px-4 py-2 rounded-lg border"
        style={{
          backgroundColor: themedColors.darkBackground,
          borderColor: themedColors.border,
        }}
      >
        <ThemedText
          className="text-sm font-uber-move-medium tracking-wider"
          style={{ color: themedColors.text }}
        >
          {selectedItem
            ? `${type} ${capitalizeFirstLetterOfWords(selectedItem)}`
            : "All " + capitalizeFirstLetterOfWords(type) + "s"}
        </ThemedText>
        <View className="ml-2" style={{ transform: [{ rotate: "-90deg" }] }}>
          <ArrowIcon width={16} height={16} stroke={themedColors.text} />
        </View>
      </TouchableOpacity>

      <Portal hostName={portalHostName}>
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
          containerStyle={{
            paddingTop: 0,
            marginTop: 0,
            zIndex: 9999,
            elevation: 9999,
          }}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView
            className="flex-1 pt-5"
            style={{ backgroundColor: themedColors.modal }}
          >
            <View
              className="px-4 mt-4"
              style={{ marginBottom: insets.bottom + 24 }}
            >
              <ThemedText className="text-[19px] font-uber-move-medium tracking-wide mb-6">
                {label}
              </ThemedText>

              <View className="flex-row flex-wrap mt-2" style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={() => handleSelect(null)}
                  className="px-5 py-3 rounded-lg border min-w-[60px] items-center"
                  style={{
                    backgroundColor:
                      selectedItem === null
                        ? themedColors.accent + "50"
                        : themedColors.inputBackground,
                    borderColor:
                      selectedItem === null
                        ? themedColors.accent
                        : themedColors.border,
                  }}
                >
                  <ThemedText
                    className="text-base font-uber-move-medium"
                    style={
                      selectedItem === null
                        ? { color: themedColors.accent }
                        : undefined
                    }
                  >
                    {"All " + capitalizeFirstLetterOfWords(type) + "s"}
                  </ThemedText>
                </TouchableOpacity>

                {items.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => handleSelect(item)}
                    className="px-5 py-3 rounded-lg border min-w-[60px] items-center"
                    style={{
                      backgroundColor:
                        selectedItem === item
                          ? themedColors.accent + "50"
                          : themedColors.inputBackground,
                      borderColor:
                        selectedItem === item
                          ? themedColors.accent
                          : themedColors.border,
                    }}
                  >
                    <ThemedText
                      className="text-base font-uber-move-medium"
                      style={
                        selectedItem === item
                          ? { color: themedColors.accent }
                          : { color: themedColors.text }
                      }
                    >
                      {item}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </>
  );
};

export default FilterSheet;
