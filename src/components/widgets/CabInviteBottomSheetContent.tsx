import React from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import {
  ThemedHR,
  ThemedText,
  ThemedTextSecondary,
} from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CabInvite } from "@/types/models/cab";
import { getCategoryImage } from "@/utils/categoryHelpers";
import { format } from "date-fns";
import { CheckCircleIcon, PencilIcon, TrashXmarkIcon } from "../icons";
import { capitalizeFirstLetterOfWords } from "@/utils/textHelpers";
import { Image } from "expo-image";

interface CabInviteBottomSheetContentProps {
  cabInvite: CabInvite | null;
  onDelete?: (id: string) => void;
  onMarkCompleted?: (id: string) => void;
  onEdit?: (cabInvite: CabInvite) => void;
  isLoading?: boolean;
}

const CabInviteBottomSheetContent: React.FC<
  CabInviteBottomSheetContentProps
> = ({ cabInvite, onDelete, onMarkCompleted, onEdit, isLoading = false }) => {
  const { themedColors, currentTheme } = useTheme();
  const insets = useSafeAreaInsets();

  if (!cabInvite) return null;

  const validFrom = new Date(cabInvite.valid_from);
  const validUntil = new Date(cabInvite.valid_until);
  const visitedAt = cabInvite.visited_at
    ? new Date(cabInvite.visited_at)
    : null;

  const formatDateTime = (date: Date) => {
    const time = format(date, "h:mm a");
    const dateStr = format(date, "d MMMM yyyy");
    return `${time} \n${dateStr}`;
  };

  const displayName = cabInvite.driver_name || cabInvite.cab_type;
  const displaySubtitle = cabInvite.vehicle_number || "Taxi";
  const imageConfig = getCategoryImage(cabInvite.cab_type, currentTheme);

  const showMarkCompleted =
    cabInvite.status === "scheduled" || cabInvite.status === "active";
  const showDelete = cabInvite.status === "scheduled";

  const handleDelete = () => {
    if (isLoading || !onDelete) return;
    Alert.alert(
      "Delete Cab Invite",
      `Delete this ${cabInvite.cab_type} invite?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(cabInvite.id),
        },
      ],
    );
  };

  const handleMarkCompleted = () => {
    if (isLoading || !onMarkCompleted) return;
    Alert.alert(
      "Mark as Completed",
      `Has this ${cabInvite.cab_type} ride been completed?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => onMarkCompleted(cabInvite.id) },
      ],
    );
  };

  return (
    <View className="px-2 pt-2" style={{ paddingBottom: insets.bottom + 16 }}>
      <View className="px-5 pt-6 pb-5">
        {/* Edit Button - Top Right */}
        {onEdit && (
          <TouchableOpacity
            onPress={() => onEdit(cabInvite)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="absolute top-4 right-4 z-10 p-3 rounded-full"
            style={{ backgroundColor: themedColors.buttonBackground }}
          >
            <PencilIcon width={16} height={16} color={themedColors.text} />
          </TouchableOpacity>
        )}
        {/* Cab Image + Name */}
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
                  width: imageConfig.imageSize
                    ? imageConfig.imageSize + 24
                    : 56,
                  height: imageConfig.imageSize
                    ? imageConfig.imageSize + 24
                    : 56,
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

        {/* Timing Section */}
        <View className="flex-row justify-between mt-4">
          <View>
            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest mb-1">
              {visitedAt ? "visited at:" : "valid from:"}
            </ThemedTextSecondary>
            <ThemedText
              className="text-base font-uber-move-medium tracking-wider"
              style={{ color: themedColors.text }}
            >
              {formatDateTime(visitedAt || validFrom)}
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

        {/* Details Section */}
        <View>
          <View className="flex-row justify-between mb-3">
            <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
              cab type
            </ThemedTextSecondary>
            <ThemedText className="text-sm font-uber-move-medium tracking-wide">
              {capitalizeFirstLetterOfWords(cabInvite.cab_type)}
            </ThemedText>
          </View>

          {cabInvite.vehicle_number && (
            <View className="flex-row justify-between mb-3 mt-4">
              <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
                vehicle number
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-uber-move-medium tracking-wide">
                {cabInvite.vehicle_number}
              </ThemedText>
            </View>
          )}

          {cabInvite.driver_name && (
            <View className="flex-row justify-between mb-3 mt-4">
              <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
                driver
              </ThemedTextSecondary>
              <ThemedText className="text-sm font-uber-move-medium tracking-wide">
                {cabInvite.driver_name}
              </ThemedText>
            </View>
          )}

          {cabInvite.notes && (
            <>
              <ThemedHR style={{ marginTop: 4, marginBottom: 20 }} />
              <View className="flex-row justify-between mb-3 mt-4">
                <ThemedTextSecondary className="text-xs font-lato-regular uppercase tracking-widest">
                  notes
                </ThemedTextSecondary>
                <ThemedText className="text-sm font-uber-move-medium tracking-wide">
                  {cabInvite.notes}
                </ThemedText>
              </View>
            </>
          )}
        </View>
      </View>

      {(showMarkCompleted || showDelete) && (
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
          {showMarkCompleted && onMarkCompleted && (
            <TouchableOpacity
              onPress={handleMarkCompleted}
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
                Already completed?
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default CabInviteBottomSheetContent;
