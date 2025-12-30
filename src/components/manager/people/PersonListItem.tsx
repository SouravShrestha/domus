import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@themes/themedComponents";
import { useTheme } from "@contexts/themeContext";
import { formatPhoneForDisplay } from "@/utils/phoneHelpers";
import basicColors from "@/themes/colors";

export type PersonType = "visitor" | "resident" | "guard";

export interface PersonItemData {
  id: string;
  name: string;
  phone?: string | null;
  photoUrl?: string | null;
  status?: string;
  role?: string;
  subtitle?: string;
  badge?: {
    text: string;
    color: string;
  };
  timestamp?: string;
  additionalInfo?: string;
}

interface PersonListItemProps {
  person: PersonItemData;
  type: PersonType;
  onPress?: (person: PersonItemData) => void;
}

const PersonListItem: React.FC<PersonListItemProps> = ({
  person,
  type,
  onPress,
}) => {
  const { themedColors } = useTheme();

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "approved":
      case "inside":
        return themedColors.success;
      case "inactive":
      case "pending":
        return basicColors.gold;
      case "rejected":
      case "expired":
        return themedColors.error;
      default:
        return themedColors.secondaryText;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(person)}
      disabled={!onPress}
      className="mx-4 mb-3 p-4 rounded-xl flex-row items-center"
      style={{ backgroundColor: themedColors.cardBackground }}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: themedColors.accent + "20" }}
      >
        <ThemedText
          className="text-base font-uber-move-bold"
          style={{ color: themedColors.accent }}
        >
          {getInitials(person.name)}
        </ThemedText>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <ThemedText className="text-base font-uber-move-medium flex-1" numberOfLines={1}>
            {person.name}
          </ThemedText>
          {person.badge && (
            <View
              className="px-2 py-1 rounded ml-2"
              style={{ backgroundColor: person.badge.color + "20" }}
            >
              <ThemedText
                className="text-xs font-uber-move-medium capitalize"
                style={{ color: person.badge.color }}
              >
                {person.badge.text}
              </ThemedText>
            </View>
          )}
        </View>

        {person.phone && (
          <ThemedText
            className="text-sm mt-0.5"
            style={{ color: themedColors.secondaryText }}
          >
            {formatPhoneForDisplay(person.phone)}
          </ThemedText>
        )}

        {person.subtitle && (
          <ThemedText
            className="text-sm mt-0.5"
            style={{ color: themedColors.secondaryText }}
          >
            {person.subtitle}
          </ThemedText>
        )}

        {person.additionalInfo && (
          <ThemedText
            className="text-xs mt-1"
            style={{ color: themedColors.secondaryText }}
          >
            {person.additionalInfo}
          </ThemedText>
        )}

        {person.status && !person.badge && (
          <View className="flex-row items-center mt-1">
            <View
              className="w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: getStatusColor(person.status) }}
            />
            <ThemedText
              className="text-xs capitalize"
              style={{ color: getStatusColor(person.status) }}
            >
              {person.status}
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default PersonListItem;
