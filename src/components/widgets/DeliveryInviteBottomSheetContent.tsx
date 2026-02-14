import React from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import {
  ThemedHR,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DeliveryInvite } from "@/types/models/delivery";
import { getCategoryImage } from "@/utils/categoryHelpers";
import { format } from "date-fns";
import { CheckCircleIcon, TrashXmarkIcon } from "../icons";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";
import { Image } from "expo-image";

interface DeliveryInviteBottomSheetContentProps {
  deliveryInvite: DeliveryInvite | null;
  onDelete?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  isLoading?: boolean;
}

const DeliveryInviteBottomSheetContent: React.FC<
  DeliveryInviteBottomSheetContentProps
> = ({ deliveryInvite, onDelete, onMarkDelivered, isLoading = false }) => {
  const { themedColors, currentTheme } = useTheme();
  const insets = useSafeAreaInsets();

  if (!deliveryInvite) return null;

  const validFrom = new Date(deliveryInvite.valid_from);
  const validUntil = new Date(deliveryInvite.valid_until);
  const enteredAt = deliveryInvite.entered_at
    ? new Date(deliveryInvite.entered_at)
    : null;

  const formatDateTime = (date: Date) => {
    const time = format(date, "h:mm a");
    const dateStr = format(date, "d MMMM yyyy");
    return `${time} \n${dateStr}`;
  };

  const displayName =
    deliveryInvite.delivery_person_name || deliveryInvite.delivery_type;
  const displaySubtitle = deliveryInvite.order_number || "Delivery";
  const imageConfig = getCategoryImage(
    deliveryInvite.delivery_type,
    currentTheme,
  );

  const showMarkDelivered =
    deliveryInvite.status === "scheduled" || deliveryInvite.status === "active";
  const showDelete = deliveryInvite.status === "scheduled";

  const handleDelete = () => {
    if (isLoading || !onDelete) return;
    Alert.alert(
      "Delete Delivery Invite",
      `Delete this ${deliveryInvite.delivery_type} invite?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(deliveryInvite.id),
        },
      ],
    );
  };

  const handleMarkDelivered = () => {
    if (isLoading || !onMarkDelivered) return;
    Alert.alert(
      "Mark as Delivered",
      `Has this ${deliveryInvite.delivery_type} been delivered?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => onMarkDelivered(deliveryInvite.id) },
      ],
    );
  };

  return (
    <View className="px-2 pt-2" style={{ paddingBottom: insets.bottom + 16 }}>
      <View className="px-5 pt-6 pb-5">
        <View className="items-center mb-6">
          {imageConfig && (
            <View
              className="rounded-full items-center justify-center mb-3"
              style={{
                width: 56,
                height: 56,
              }}
            >
              <Image
                source={imageConfig.source}
                style={{
                  width: (imageConfig.imageSize || 14) + 24,
                  height: (imageConfig.imageSize || 14) + 24,
                }}
                contentFit="contain"
              />
            </View>
          )}
          <ThemedText
            className="text-xl font-uber-move-medium tracking-wider text-center"
            style={{ color: themedColors.text }}
          >
            {capitalizeFirstLetterOfWords(displayName)}
          </ThemedText>
          <ThemedText
            className="text-sm font-uber-move-medium mt-1 tracking-wider text-center"
            style={{ color: themedColors.text }}
          >
            {capitalizeFirstLetterOfWords(displaySubtitle)}
          </ThemedText>
        </View>

        <View className="flex-row justify-between mt-4">
          <View>
            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest mb-1">
              {enteredAt ? "entered at:" : "valid from:"}
            </ThemedTextSecondary>
            <ThemedText
              className="text-base font-uber-move-medium tracking-wider"
              style={{ color: themedColors.text }}
            >
              {formatDateTime(enteredAt || validFrom)}
            </ThemedText>
          </View>
          <View>
            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest mb-1">
              valid till:
            </ThemedTextSecondary>
            <ThemedText
              className="text-base font-uber-move-medium tracking-wider"
              style={{ color: themedColors.text }}
            >
              {formatDateTime(validUntil)}
            </ThemedText>
          </View>
        </View>

        <ThemedHR style={{ marginTop: 18, marginBottom: 18 }} />

        <View>
          <View className="flex-row justify-between mb-3">
            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
              delivery type
            </ThemedTextSecondary>
            <ThemedText className="text-sm font-uber-move-medium tracking-wide">
              {capitalizeFirstLetterOfWords(deliveryInvite.delivery_type)}
            </ThemedText>
          </View>

          {deliveryInvite.order_number && (
            <View className="flex-row justify-between mb-3 mt-4">
              <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
                order number
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-uber-move-medium tracking-wide">
                {deliveryInvite.order_number}
              </ThemedText>
            </View>
          )}

          {deliveryInvite.delivery_person_name && (
            <View className="flex-row justify-between mb-3 mt-4">
              <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
                delivery person
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-uber-move-medium tracking-wide">
                {deliveryInvite.delivery_person_name}
              </ThemedText>
            </View>
          )}

          {deliveryInvite.notes && (
            <>
              <ThemedHR style={{ marginTop: 4, marginBottom: 20 }} />
              <View className="flex-row justify-between mb-3 mt-4">
                <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
                  notes
                </ThemedTextSecondary>
                <ThemedText className="text-sm font-uber-move-medium tracking-wide">
                  {deliveryInvite.notes}
                </ThemedText>
              </View>
            </>
          )}
        </View>
      </View>

      {(showMarkDelivered || showDelete) && (
        <View className="flex-row mx-5 mt-2" style={{ gap: 10 }}>
          {showDelete && onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              activeOpacity={0.7}
              disabled={isLoading}
              className="flex-row items-center justify-center py-4 rounded-full w-14"
              style={{
                backgroundColor: themedColors.error,
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <TrashXmarkIcon
                width={16}
                height={16}
                color={themedColors.buttonText}
              />
            </TouchableOpacity>
          )}
          {showMarkDelivered && onMarkDelivered && (
            <TouchableOpacity
              onPress={handleMarkDelivered}
              activeOpacity={0.7}
              disabled={isLoading}
              className="flex-row items-center justify-center py-4 rounded-full"
              style={{
                flex: 1,
                backgroundColor: themedColors.buttonBackground,
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <CheckCircleIcon
                width={16}
                height={16}
                color={themedColors.buttonText}
              />
              <Text
                className="text-base font-uber-move-medium ml-2"
                style={{ color: themedColors.buttonText }}
              >
                Already delivered?
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default DeliveryInviteBottomSheetContent;
