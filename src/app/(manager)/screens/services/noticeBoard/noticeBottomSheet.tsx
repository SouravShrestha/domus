import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View, TouchableOpacity, ScrollView, Alert } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ThemedHR, ThemedText, ThemedTextSecondary } from "@themes/themedComponents";
import { useTheme } from "@/contexts/themeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Notice } from "@/api/interfaces/notice.interface";
import { format } from "date-fns";
import { router } from "expo-router";
import { deleteNotice } from "@/api/services/notice.service";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import basicColors from "@/themes/colors";
import { EditIcon, EyeIcon, TrashXmarkIcon } from "@/components/icons";

export interface NoticeBottomSheetRef {
  open: (notice: Notice) => void;
  close: () => void;
}

interface NoticeBottomSheetProps {
  onComplete?: () => void;
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

const visibilityLabels = {
  all: "All Residents",
  owners_only: "Owners Only",
  security_guards: "Security Guards",
};

const NoticeBottomSheet = forwardRef<NoticeBottomSheetRef, NoticeBottomSheetProps>(
  ({ onComplete }, ref) => {
    const { themedColors } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useImperativeHandle(ref, () => ({
      open: (selectedNotice: Notice) => {
        setNotice(selectedNotice);
        setTimeout(() => {
          bottomSheetRef.current?.expand();
        }, 50);
      },
      close: () => {
        bottomSheetRef.current?.close();
        setNotice(null);
      },
    }));

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    );

    const handleEdit = () => {
      if (!notice) return;
      bottomSheetRef.current?.close();
      setTimeout(() => {
        router.push({
          pathname: "/(manager)/screens/services/noticeBoard/edit",
          params: { noticeId: notice.id },
        });
      }, 300);
    };

    const handleDelete = () => {
      if (!notice) return;

      Alert.alert(
        "Delete Notice",
        "Are you sure you want to delete this notice? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setIsDeleting(true);
              try {
                const { error } = await deleteNotice(notice.id);
                if (error) {
                  showErrorToast("Failed to delete notice");
                  return;
                }
                showSuccessToast("Notice deleted successfully");
                bottomSheetRef.current?.close();
                setTimeout(() => {
                  setNotice(null);
                  onComplete?.();
                }, 300);
              } catch (error) {
                showErrorToast("Failed to delete notice");
              } finally {
                setIsDeleting(false);
              }
            },
          },
        ]
      );
    };

    const categoryColor = categoryColors[notice?.category || 'general'];
    const formattedDate = notice ? (() => {
      try {
        const date = new Date(notice.created_at);
        if (isNaN(date.getTime())) {
          return "Invalid date";
        }
        return format(date, "hh:mm a, MMM dd yyyy");
      } catch {
        return "Invalid date";
      }
    })() : "";

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose
        enableDynamicSizing
        backgroundStyle={{
          backgroundColor: themedColors.modal,
        }}
        handleIndicatorStyle={{
          backgroundColor: themedColors.accent,
        }}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={{ backgroundColor: themedColors.modal }}>
          {notice && (
          <View
            style={{
              paddingTop: 16,
              maxHeight: 600,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false} className="px-5" contentContainerStyle={{ paddingBottom: insets.bottom }}>
              <View className="flex-row items-center justify-between mb-4">
                <View
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${categoryColor}15` }}
                >
                  <ThemedText
                    className="text-xs font-uber-move-medium"
                    style={{ color: categoryColor }}
                  >
                    {categoryLabels[notice.category]}
                  </ThemedText>
                </View>
                <View className="px-3 py-1.5 rounded-full">
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

              <ThemedText className="text-2xl font-uber-move-medium mb-3">
                {notice.title}
              </ThemedText>

              <ThemedTextSecondary className="text-base font-lato-regular leading-6 mb-4">
                {notice.description}
              </ThemedTextSecondary>

              <ThemedHR />
              <View className="mt-6 mb-3 flex-row items-center">
                <EyeIcon
                  height={14}
                  width={14}
                  color={themedColors.text}
                />
                <ThemedText className="text-base font-uber-move-medium ml-2">
                  {visibilityLabels[notice.audience.visibility]}
                </ThemedText>
              </View>

              <View className="flex-row items-center justify-between mb-6">
                <View>
                  <ThemedTextSecondary className="text-sm font-uber-move-medium">
                    {formattedDate}
                  </ThemedTextSecondary>
                </View>
                <View>
                  <ThemedTextSecondary className="text-sm font-uber-move-medium">
                    {notice.created_by_name || "Unknown"}
                  </ThemedTextSecondary>
                </View>
              </View>

              <View className="flex-row gap-3 mb-4 mt-2">
                <TouchableOpacity
                  onPress={handleEdit}
                  disabled={isDeleting}
                  className="flex-1 flex-row items-center justify-center rounded-md py-3.5"
                  style={{
                    backgroundColor: themedColors.accent,
                  }}
                >
                  <EditIcon
                    height={16}
                    width={16}
                    color={themedColors.textOnAccent}
                  />
                  <ThemedText
                    className="text-base font-uber-move-bold ml-2"
                    style={{ color: themedColors.textOnAccent }}
                  >
                    Edit
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 flex-row items-center justify-center rounded-md py-3.5"
                  style={{
                    backgroundColor: `${basicColors.red}50`,
                    opacity: isDeleting ? 0.5 : 1,
                  }}
                >
                  <TrashXmarkIcon
                    height={16}
                    width={16}
                    color={basicColors.red}
                  />
                  <ThemedText
                    className="text-base font-uber-move-bold ml-2"
                    style={{ color: basicColors.red }}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

NoticeBottomSheet.displayName = "NoticeBottomSheet";

export default NoticeBottomSheet;
