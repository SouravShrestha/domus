import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { format } from "date-fns";
import { Notice } from "@/api/interfaces";
import IconPillButton from "../widgets/IconPillButton";
import IconTagPill from "../widgets/IconTagPill";

interface NoticeCardProps {
  notice: Notice;
  onPress?: () => void;
  createdByName?: string;
}

const categoryColors = {
  general: "#3B82F6",
  maintenance: "#F59E0B",
  event: "#10B981",
  emergency: "#EF4444",
  administrative: "#8B5CF6",
};

const priorityLabels = {
  normal: "Normal",
  important: "Important",
  urgent: "Urgent",
};

const categoryLabels = {
  general: "General",
  maintenance: "Maintenance",
  event: "Event",
  emergency: "Emergency",
  administrative: "Administrative",
};

const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onPress }) => {
  const { themedColors } = useTheme();

  const categoryColor = categoryColors[notice.category];

  const formattedDate = (() => {
    try {
      const date = new Date(notice.created_at);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return format(date, "hh:mm a, MMM dd yyyy");
    } catch {
      return "Invalid date";
    }
  })();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="rounded-lg p-4 mb-5"
      style={{
        backgroundColor: themedColors.cardBackground,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <IconTagPill
          iconKey={categoryLabels[notice.category].toLocaleLowerCase()}
          label={categoryLabels[notice.category]}
        />
        <View className="px-3 py-1 rounded-full">
          <ThemedText
            className="text-xs font-uber-move-medium"
            style={{
              color:
                notice.priority === "urgent"
                  ? "#DC2626"
                  : notice.priority === "important"
                    ? "#D97706"
                    : themedColors.secondaryText,
            }}
          >
            {priorityLabels[notice.priority]}
          </ThemedText>
        </View>
      </View>

      <ThemedText className="text-lg font-uber-move-medium mb-2">
        {notice.title}
      </ThemedText>

      <ThemedTextSecondary
        className="text-sm font-lato-regular mb-3 leading-5"
        numberOfLines={3}
      >
        {notice.description}
      </ThemedTextSecondary>

      <View
        className="pt-3 border-t"
        style={{ borderTopColor: themedColors.lightBorder }}
      >
        <View className="flex-row items-center justify-between">
          <ThemedTextSecondary className="text-xs font-lato-regular">
            {formattedDate}
          </ThemedTextSecondary>
          <ThemedTextSecondary className="text-xs font-lato-regular">
            {notice.created_by_name || "Unknown"}
          </ThemedTextSecondary>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NoticeCard;
