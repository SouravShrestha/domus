import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { themeColors } from "@themes/colors";
import { IconProps } from "@/types/common";

export interface HeaderMenuItem {
  label: string;
  icon: React.FC<IconProps>;
  onPress: () => void;
}

interface HeaderMenuBottomSheetProps {
  items: HeaderMenuItem[];
  onClose: () => void;
}

const HeaderMenuBottomSheet: React.FC<HeaderMenuBottomSheetProps> = ({
  items,
  onClose,
}) => {
  const { currentTheme } = useTheme();
  const colors = themeColors[currentTheme];
  const insets = useSafeAreaInsets();

  const handleItemPress = (item: HeaderMenuItem) => {
    onClose();
    item.onPress();
  };

  return (
    <View
      className="flex-1 px-6 w-full"
      style={{
        backgroundColor: colors.modal,
        marginBottom: insets.bottom,
        marginTop: 14,
      }}
    >
      <View className="flex-row justify-start items-center mb-7 pr-1 pl-1">
        <ThemedText className="text-[19px] font-uber-move-medium tracking-wide">
          More actions
        </ThemedText>
      </View>

      <View className="flex-row flex-wrap" style={{ gap: 10 }}>
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.9}
              className="items-center rounded-md h-28 justify-between pb-4 pt-5"
              style={{
                backgroundColor: colors.cardBackground,
                width: "31%",
                borderWidth: 1,
                borderColor: colors.lightBorder,
              }}
            >
              <Icon width={22} height={22} color={colors.text} />
              <ThemedText
                className="text-center font-uber-move-medium tracking-wide leading-5"
                numberOfLines={2}
                style={{ fontSize: 15 }}
              >
                {item.label.toLocaleLowerCase().replace(" ", "\n")}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default HeaderMenuBottomSheet;
