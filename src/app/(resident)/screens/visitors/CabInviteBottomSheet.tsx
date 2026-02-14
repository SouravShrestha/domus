import React, { useCallback, forwardRef } from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useTheme } from "@/contexts/themeContext";
import { CabInvite } from "@/types/models/cab";
import CabInviteBottomSheetContent from "@/components/widgets/CabInviteBottomSheetContent";

interface CabInviteBottomSheetProps {
  cabInvite: CabInvite | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onMarkCompleted?: (id: string) => void;
  isLoading?: boolean;
}

const CabInviteBottomSheet = forwardRef<BottomSheet, CabInviteBottomSheetProps>(
  ({ cabInvite, onClose, onDelete, onMarkCompleted, isLoading }, ref) => {
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
            <CabInviteBottomSheetContent
              cabInvite={cabInvite}
              onDelete={onDelete}
              onMarkCompleted={onMarkCompleted}
              isLoading={isLoading}
            />
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    );
  },
);

CabInviteBottomSheet.displayName = "CabInviteBottomSheet";

export default CabInviteBottomSheet;
