import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { TouchableOpacity, View, ScrollView } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BlockSelectorBottomSheetProps {
  blocks: string[];
  selectedBlock: string | null;
  onSelect: (block: string) => void;
}

export interface BlockSelectorBottomSheetRef {
  open: () => void;
  close: () => void;
}

const BlockSelectorBottomSheet = forwardRef<
  BlockSelectorBottomSheetRef,
  BlockSelectorBottomSheetProps
>(({ blocks, selectedBlock, onSelect }, ref) => {
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

  const handleSelectBlock = (block: string) => {
    onSelect(block);
    bottomSheetRef.current?.close();
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
      snapPoints={["50%"]}
    >
      <BottomSheetView
        className="flex-1 pt-5"
        style={{ backgroundColor: themedColors.modal }}
      >
        <View className="px-6" style={{ paddingBottom: insets.bottom + 24 }}>
          <ThemedText className="text-xl font-uber-move-medium tracking-wide mb-6 mt-4">
            Select Block
          </ThemedText>

          {blocks.length === 0 && (
            <ThemedText
              className="text-sm font-lato-regular text-center py-8"
              style={{ color: themedColors.secondaryText }}
            >
              No blocks available
            </ThemedText>
          )}

          <ScrollView style={{ maxHeight: 400 }}>
            <View style={{ gap: 12 }}>
              {blocks.map((block) => {
                const isSelected = selectedBlock === block;

                return (
                  <TouchableOpacity
                    key={block}
                    onPress={() => handleSelectBlock(block)}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: isSelected
                        ? themedColors.accent + "10"
                        : themedColors.cardBackground,
                      borderColor: isSelected
                        ? themedColors.accent
                        : themedColors.border,
                    }}
                  >
                    <ThemedText
                      className="text-lg font-uber-move-medium tracking-wide"
                      style={{
                        color: isSelected
                          ? themedColors.accent
                          : themedColors.text,
                      }}
                    >
                      {block}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

BlockSelectorBottomSheet.displayName = "BlockSelectorBottomSheet";

export default BlockSelectorBottomSheet;
