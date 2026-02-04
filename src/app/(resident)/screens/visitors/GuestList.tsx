import React from "react";
import { View, TouchableOpacity } from "react-native";
import {
  ThemedTextSecondary,
  ThemedText,
  ThemedHR,
} from "@themes/themedComponents";
import { ProfileIcon } from "@/components/widgets/ProfileIcon";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { formatDateTime } from "@/utils/dateHelpers";

interface GuestItem {
  id: string;
  name: string;
  phone: string;
  time: string;
}

interface GuestListProps {
  items: GuestItem[];
  maxItems?: number;
  emptyMessage?: string;
  onItemPress?: (id: string) => void;
}

const GuestCard: React.FC<{ name: string; phone: string; time: string }> = ({
  name,
  phone,
  time,
}) => (
  <View className="py-2">
    <View className="flex-row items-start">
      <View className="mr-3.5 mt-1">
        <ProfileIcon username={name} size={40} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-start justify-between">
          <ThemedText className="text-base font-uber-move-medium tracking-wide flex-1">
            {name}
          </ThemedText>
        </View>
        <ThemedTextSecondary className="text-base font-uber-move-medium tracking-wide mt-1">
          {formatPhoneForDisplay(phone)}
        </ThemedTextSecondary>
      </View>
      <ThemedTextSecondary className="text-sm font-lato-regular ml-2 mt-1">
        {formatDateTime(time)}
      </ThemedTextSecondary>
    </View>
  </View>
);

const GuestList: React.FC<GuestListProps> = ({
  items,
  maxItems = 5,
  emptyMessage = "all caught up",
  onItemPress,
}) => {
  if (items.length === 0) {
    return (
      <View className="py-8 items-center">
        <ThemedTextSecondary className="text-base font-uber-move-medium tracking-wide">
          {emptyMessage}
        </ThemedTextSecondary>
      </View>
    );
  }

  const displayItems = items.slice(0, maxItems);

  return (
    <>
      {displayItems.map((item, index) => (
        <View key={item.id}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onItemPress?.(item.id)}
          >
            <GuestCard name={item.name} phone={item.phone} time={item.time} />
          </TouchableOpacity>
          {index !== displayItems.length - 1 && <ThemedHR className="my-4" />}
        </View>
      ))}
    </>
  );
};

export default GuestList;
export { GuestCard };
export type { GuestItem };
