import React, { useCallback, forwardRef } from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useTheme } from "@/contexts/themeContext";
import { DeliveryInvite } from "@/types/models/delivery";
import DeliveryInviteBottomSheetContent from "@/components/widgets/DeliveryInviteBottomSheetContent";

interface DeliveryInviteBottomSheetProps {
  deliveryInvite: DeliveryInvite | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  isLoading?: boolean;
}

const DeliveryInviteBottomSheet = forwardRef<
  BottomSheet,
  DeliveryInviteBottomSheetProps
>(({ deliveryInvite, onClose, onDelete, onMarkDelivered, isLoading }, ref) => {
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
          <DeliveryInviteBottomSheetContent
            deliveryInvite={deliveryInvite}
            onDelete={onDelete}
            onMarkDelivered={onMarkDelivered}
            isLoading={isLoading}
          />
        </BottomSheetView>
      </BottomSheet>
    </Portal>
  );
});

DeliveryInviteBottomSheet.displayName = "DeliveryInviteBottomSheet";

export default DeliveryInviteBottomSheet;
