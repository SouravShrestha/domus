import React, { useCallback, forwardRef } from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useTheme } from "@/contexts/themeContext";
import { GuestLogWithInvitation } from "@/types/models/visitor";
import GuestInsideBottomSheetContent from "@/components/widgets/GuestInsideBottomSheetContent";

interface GuestInsideBottomSheetProps {
  guest: GuestLogWithInvitation | null;
  onClose: () => void;
  onMarkLeft?: (logId: string) => void;
  isLoading?: boolean;
}

const GuestInsideBottomSheet = forwardRef<
  BottomSheet,
  GuestInsideBottomSheetProps
>(({ guest, onClose, onMarkLeft, isLoading }, ref) => {
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
          <GuestInsideBottomSheetContent
            guest={guest}
            onMarkLeft={onMarkLeft}
            isLoading={isLoading}
          />
        </BottomSheetView>
      </BottomSheet>
    </Portal>
  );
});

GuestInsideBottomSheet.displayName = "GuestInsideBottomSheet";

export default GuestInsideBottomSheet;
