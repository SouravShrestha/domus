import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View, ScrollView } from "react-native";
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
import { EyeIcon } from "@/components/icons";
import IconTagPill from "@/components/widgets/IconTagPill";

export interface NoticeBottomSheetRef {
  open: (notice: Notice) => void;
  close: () => void;
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

const NoticeBottomSheet = forwardRef<NoticeBottomSheetRef>(
  (_, ref) => {
    const { themedColors } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [notice, setNotice] = useState<Notice | null>(null);

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
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="px-5"
                contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <IconTagPill
                    iconKey={categoryLabels[
                      notice.category
                    ].toLocaleLowerCase()}
                    label={categoryLabels[notice.category]}
                  />
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
                  <EyeIcon height={14} width={14} color={themedColors.text} />
                  <ThemedText className="text-base font-uber-move-medium ml-2">
                    {visibilityLabels[notice.audience.visibility]}
                  </ThemedText>
                </View>

                <View className="flex-row items-center justify-between mb-4">
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
