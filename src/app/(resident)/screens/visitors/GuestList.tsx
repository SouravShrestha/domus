import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import {
  ThemedTextSecondary,
  ThemedText,
  ThemedHR,
} from "@themes/themedComponents";
import { ProfileIcon } from "@/components/widgets/ProfileIcon";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import { formatDateTime } from "@/utils/dateHelpers";
import { useTheme } from "@/contexts/themeContext";
import { getCategoryImage } from "@/utils/categoryHelpers";
import { Image } from "expo-image";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";

interface GuestItem {
  id: string;
  name: string;
  phone: string;
  time: string;
  imageKey?: string;
  itemType?: "guest" | "cab";
}

interface GuestListProps {
  items: GuestItem[];
  maxItems?: number;
  emptyMessage?: string;
  onItemPress?: (id: string) => void;
}

const CabAvatar: React.FC<{ imageKey: string }> = ({ imageKey }) => {
  const { currentTheme } = useTheme();
  const imageConfig = getCategoryImage(imageKey, currentTheme);

  return (
    <View
      className="rounded-full items-center justify-center"
      style={{
        width: 40,
        height: 40,
      }}
    >
      {imageConfig ? (
        <Image
          source={imageConfig.source}
          style={{
            width: imageConfig.imageSize + 24,
            height: imageConfig.imageSize + 24,
          }}
          contentFit="contain"
        />
      ) : null}
    </View>
  );
};

const GuestCard: React.FC<{
  name: string;
  phone: string;
  time: string;
  imageKey?: string;
}> = ({ name, phone, time, imageKey }) => (
  <View className="py-2">
    <View className="flex-row items-start">
      <View className="mr-3.5 mt-1">
        {imageKey ? (
          <CabAvatar imageKey={imageKey} />
        ) : (
          <ProfileIcon username={name} size={40} />
        )}
      </View>
      <View className="flex-1">
        <View className="flex-row items-start justify-between">
          <ThemedText className="text-base font-uber-move-medium tracking-wide flex-1">
            {capitalizeFirstLetterOfWords(name)}
          </ThemedText>
        </View>
        <ThemedTextSecondary className="text-sm font-uber-move-medium tracking-wider mt-1">
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
            <GuestCard
              name={item.name}
              phone={item.phone}
              time={item.time}
              imageKey={item.imageKey}
            />
          </TouchableOpacity>
          {index !== displayItems.length - 1 && <ThemedHR className="my-4" />}
        </View>
      ))}
    </>
  );
};

export default GuestList;
export { GuestCard, GuestListSkeleton };
export type { GuestItem };

const SkeletonCard: React.FC<{ opacity: Animated.Value; color: string }> = ({
  opacity,
  color,
}) => (
  <Animated.View className="py-2" style={{ opacity }}>
    <View className="flex-row items-start">
      <View
        className="mr-3.5 mt-1 rounded-full"
        style={{ width: 40, height: 40, backgroundColor: color }}
      />
      <View className="flex-1">
        <View
          className="h-4 rounded-md w-2/3"
          style={{ backgroundColor: color }}
        />
        <View
          className="h-3 rounded-md w-1/2 mt-2.5"
          style={{ backgroundColor: color }}
        />
      </View>
      <View
        className="h-3 rounded-md ml-2 mt-1"
        style={{ width: 60, backgroundColor: color }}
      />
    </View>
  </Animated.View>
);

const GuestListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  const { themedColors } = useTheme();
  const [pulseAnim] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index}>
          <SkeletonCard opacity={pulseAnim} color={themedColors.border} />
          {index !== count - 1 && <ThemedHR className="my-4" />}
        </View>
      ))}
    </>
  );
};
