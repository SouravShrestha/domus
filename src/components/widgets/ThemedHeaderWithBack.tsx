import React, { useRef, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  GestureResponderEvent,
  StyleProp,
  TextStyle,
  ViewProps,
} from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import { ThemedText } from "@themes/themedComponents";
import ArrowIcon from "@icons/ArrowIcon";
import { MenuDotsIcon } from "@/components/icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import HeaderMenuBottomSheet, {
  HeaderMenuItem,
} from "@/components/widgets/HeaderMenuBottomSheet";

export type { HeaderMenuItem };

interface ThemedHeaderWithBackProps extends ViewProps {
  onBackPress?: (event: GestureResponderEvent) => void;
  title: string;
  titleStyle?: object & StyleProp<TextStyle>;
  menuItems?: HeaderMenuItem[];
}

const ThemedHeaderWithBack: React.FC<ThemedHeaderWithBackProps> = ({
  onBackPress,
  title,
  titleStyle,
  menuItems,
  ...props
}) => {
  const { currentTheme, themedColors } = useTheme();
  const colors: any = themeColors[currentTheme] || {};
  const menuBottomSheetRef = useRef<BottomSheet>(null);

  const handleMenuPress = useCallback(() => {
    menuBottomSheetRef.current?.expand();
  }, []);

  const handleMenuClose = useCallback(() => {
    menuBottomSheetRef.current?.close();
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
    [],
  );

  return (
    <>
      <View
        className="flex-row items-center justify-between"
        {...props}
        style={{ marginTop: 6 }}
      >
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={onBackPress}
            className="mr-2 w-10 h-9 items-center justify-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowIcon width={24} height={24} stroke={colors.text} />
          </TouchableOpacity>
          <ThemedText
            className="text-2xl font-uber-move-medium tracking-wider mb-0.5"
            style={titleStyle}
          >
            {title}
          </ThemedText>
        </View>
        {menuItems && menuItems.length > 0 && (
          <TouchableOpacity
            onPress={handleMenuPress}
            className="w-10 h-9 items-center justify-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MenuDotsIcon width={20} height={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {menuItems && menuItems.length > 0 && (
        <Portal hostName="global">
          <BottomSheet
            ref={menuBottomSheetRef}
            index={-1}
            enableDynamicSizing={true}
            enablePanDownToClose
            enableHandlePanningGesture={true}
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
          >
            <BottomSheetView
              className="flex-1"
              style={{ backgroundColor: themedColors.modal }}
            >
              <HeaderMenuBottomSheet
                items={menuItems}
                onClose={handleMenuClose}
              />
            </BottomSheetView>
          </BottomSheet>
        </Portal>
      )}
    </>
  );
};

export default ThemedHeaderWithBack;
