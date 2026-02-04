import React, { useCallback, forwardRef } from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useTheme } from "@/contexts/themeContext";
import { UnifiedGuestHistoryEntry } from "@/types/models/visitor";
import GuestHistoryBottomSheetContent from "@/components/widgets/GuestHistoryBottomSheetContent";

interface GuestHistoryBottomSheetProps {
  entry: UnifiedGuestHistoryEntry | null;
  onClose: () => void;
}

const GuestHistoryBottomSheet = forwardRef<
  BottomSheet,
  GuestHistoryBottomSheetProps
>(({ entry, onClose }, ref) => {
  const { themedColors } = useTheme();

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
    [],
  );

  return (
    <Portal hostName="global">
      <BottomSheet
        ref={ref}
        index={-1}
        enablePanDownToClose
        enableDynamicSizing
        backgroundStyle={{
          backgroundColor: themedColors.modal,
        }}
        handleIndicatorStyle={{
          backgroundColor: themedColors.accent,
        }}
        containerStyle={{
          zIndex: 9999,
          elevation: 9999,
        }}
        backdropComponent={renderBackdrop}
        onChange={(index) => {
          if (index === -1) onClose();
        }}
      >
        <BottomSheetView
          className="flex-1"
          style={{ backgroundColor: themedColors.modal }}
        >
          <GuestHistoryBottomSheetContent entry={entry} />
        </BottomSheetView>
      </BottomSheet>
    </Portal>
  );
});

GuestHistoryBottomSheet.displayName = "GuestHistoryBottomSheet";

export default GuestHistoryBottomSheet;
