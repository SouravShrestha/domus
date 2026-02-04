import React, { useCallback, forwardRef } from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useTheme } from "@/contexts/themeContext";
import { GuestInvitationWithDetails } from "@/types/models/visitor";
import GuestInvitationQRBottomSheetContent from "@/components/widgets/GuestInvitationQRBottomSheet";

interface GuestInvitationQRBottomSheetProps {
  invitation: GuestInvitationWithDetails | null;
  onClose: () => void;
  onDelete?: (invitationId: string) => void;
  isLoading?: boolean;
}

const GuestInvitationQRBottomSheet = forwardRef<
  BottomSheet,
  GuestInvitationQRBottomSheetProps
>(({ invitation, onClose, onDelete, isLoading }, ref) => {
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
          <GuestInvitationQRBottomSheetContent
            invitation={invitation}
            onDelete={onDelete}
            isLoading={isLoading}
          />
        </BottomSheetView>
      </BottomSheet>
    </Portal>
  );
});

GuestInvitationQRBottomSheet.displayName = "GuestInvitationQRBottomSheet";

export default GuestInvitationQRBottomSheet;
