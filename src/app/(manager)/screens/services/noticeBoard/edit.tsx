import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
} from "@themes/themedComponents";
import { router, useLocalSearchParams } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { useTheme } from "@/contexts/themeContext";
import { useAuth } from "@/contexts/authContext";
import { useResidence } from "@/contexts/residenceContext";
import {
  NoticeCategory,
  NoticePriority,
  NoticeVisibility,
  NoticeAudience,
} from "@/types/models/notice";
import AudienceSelector from "@/components/manager/AudienceSelector";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import IconPillButton from "@/components/widgets/IconPillButton";
import basicColors from "@/themes/colors";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { updateNotice, getSocietyNotices } from "@/api/services/notice.service";
import BackButton from "@/components/widgets/BackButton";
import { Notice } from "@/api/interfaces/notice.interface";

const CATEGORY_LABELS: Record<NoticeCategory, string> = {
  [NoticeCategory.General]: "General",
  [NoticeCategory.Maintenance]: "Maintenance",
  [NoticeCategory.Event]: "Event",
  [NoticeCategory.Emergency]: "Emergency",
  [NoticeCategory.Administrative]: "Administrative",
};

const PRIORITY_LABELS: Record<NoticePriority, string> = {
  [NoticePriority.Normal]: "Normal",
  [NoticePriority.Important]: "Important",
  [NoticePriority.Urgent]: "Urgent",
};

const PRIORITY_COLORS: Record<NoticePriority, string> = {
  [NoticePriority.Normal]: "#10B981",
  [NoticePriority.Important]: "#F59E0B",
  [NoticePriority.Urgent]: "#EF4444",
};

const EditNoticeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentTheme, themedColors } = useTheme();
  const { user } = useAuth();
  const { currentResidence } = useResidence();
  const params = useLocalSearchParams();
  const noticeId = params.noticeId as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const descriptionInputRef = useRef<View>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<NoticeCategory>(
    NoticeCategory.General
  );
  const [priority, setPriority] = useState<NoticePriority>(
    NoticePriority.Normal
  );
  const [audience, setAudience] = useState<NoticeAudience>({
    visibility: NoticeVisibility.All,
  });

  useEffect(() => {
    const loadNotice = async () => {
      if (!currentResidence?.society?.id || !noticeId) {
        showErrorToast("Missing required information");
        router.back();
        return;
      }

      try {
        const { data, error } = await getSocietyNotices(currentResidence.society.id);
        if (error || !data) {
          showErrorToast("Failed to load notice");
          router.back();
          return;
        }

        const notice = data.find((n: Notice) => n.id === noticeId);
        if (!notice) {
          showErrorToast("Notice not found");
          router.back();
          return;
        }

        setTitle(notice.title);
        setDescription(notice.description);
        setCategory(notice.category);
        setPriority(notice.priority);
        setAudience(notice.audience);
      } catch (error) {
        console.error("Error loading notice:", error);
        showErrorToast("Failed to load notice");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    loadNotice();
  }, [noticeId, currentResidence?.society?.id]);

  const handleDonePress = () => {
    if (!title.trim() || !description.trim()) {
      showErrorToast("Please fill in all required fields");
      return;
    }

    Alert.alert(
      "Update Notice?",
      "This will update the notice with the new information.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Update",
          onPress: handleUpdate,
        },
      ]
    );
  };

  const handleUpdate = async () => {
    if (!user?.id || !currentResidence?.society_id) {
      showErrorToast("Missing required information");
      return;
    }

    Keyboard.dismiss();

    setIsSaving(true);

    const noticeInput = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      audience,
    };

    try {
      const { error } = await updateNotice(noticeId, noticeInput);

      if (error) {
        console.error("Error updating notice:", error);
        showErrorToast("Failed to update notice");
      } else {
        showSuccessToast("Notice updated successfully!");
        router.back();
      }
    } catch (error) {
      console.error("Error updating notice:", error);
      showErrorToast("Failed to update notice");
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = title.trim().length > 0 && description.trim().length > 0;

  if (isLoading) {
    return (
      <ThemedView className="flex-1">
        <LoadingOverlay currentTheme={currentTheme} withToast={false} />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ marginTop: insets.top }} className="flex-1">
          <View className="px-3 pt-3 pb-2">
            <View className="flex-row items-center justify-between">
              <BackButton onPress={() => router.back()} />
              <TouchableOpacity
                onPress={handleDonePress}
                disabled={!canSave || isSaving}
                className="py-2 px-4 rounded-lg"
                style={{
                  opacity: canSave && !isSaving ? 1 : 0.5,
                }}
              >
                <ThemedText
                  className="text-base font-uber-move-bold"
                  style={{ color: themedColors.accent }}
                >
                  Save
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedText className="text-2xl font-uber-move-medium mt-2 px-3">
              edit notice
            </ThemedText>
          </View>

          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-6 mt-2"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="py-2 space-y-6">
              <View>
                <ThemedText className="text-sm font-uber-move-medium mb-2.5">
                  What is this for?
                </ThemedText>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Water Supply Interruption"
                  placeholderTextColor={themedColors.secondaryText}
                  className="font-lato-regular px-4 rounded-md"
                  style={{
                    backgroundColor: themedColors.cardBackground,
                    color: themedColors.text,
                    height: 48,
                    fontSize: 16,
                  }}
                  maxLength={100}
                />
              </View>

              <View>
                <ThemedText className="text-sm font-uber-move-medium mb-2.5">
                  Choose notice category
                </ThemedText>
                <View
                  className="flex-row flex-wrap"
                  style={{ columnGap: 8, rowGap: 10 }}
                >
                  {Object.values(NoticeCategory).map((cat) => (
                    <IconPillButton
                      key={cat}
                      label={CATEGORY_LABELS[cat]}
                      isSelected={category === cat}
                      onPress={() => setCategory(cat)}
                    />
                  ))}
                </View>
              </View>

              <View>
                <ThemedText className="text-sm font-uber-move-medium mb-2.5">
                  How important is this?
                </ThemedText>
                <View
                  className="flex-row flex-wrap"
                  style={{ columnGap: 8, rowGap: 10 }}
                >
                  {Object.values(NoticePriority).map((pri) => (
                    <IconPillButton
                      key={pri}
                      label={PRIORITY_LABELS[pri]}
                      isSelected={priority === pri}
                      onPress={() => setPriority(pri)}
                      selectedColor={PRIORITY_COLORS[pri]}
                      selectedTextColor="#FFFFFF"
                      unselectedColor={themedColors.background}
                      icon={
                        <View
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              priority === pri
                                ? basicColors.white
                                : PRIORITY_COLORS[pri],
                          }}
                        />
                      }
                    />
                  ))}
                </View>
              </View>

              <View ref={descriptionInputRef}>
                <ThemedText className="text-sm font-uber-move-medium mb-2.5">
                  Description
                </ThemedText>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="enter notice details here..."
                  placeholderTextColor={themedColors.secondaryText}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  onFocus={() => {
                    setTimeout(() => {
                      descriptionInputRef.current?.measureLayout(
                        scrollViewRef.current as any,
                        (x, y) => {
                          scrollViewRef.current?.scrollTo({
                            y: y - 20,
                            animated: true,
                          });
                        },
                        () => {},
                      );
                    }, 100);
                  }}
                  className="font-lato-regular text-base px-4 py-3 rounded-md"
                  style={{
                    backgroundColor: themedColors.cardBackground,
                    color: themedColors.text,
                    minHeight: 120,
                  }}
                />
              </View>

              <View className="mb-4">
                <ThemedText className="text-sm font-uber-move-medium mb-2.5">
                  Who should see this?
                </ThemedText>
                <AudienceSelector
                  audience={audience}
                  onAudienceChange={setAudience}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      {isSaving && (
        <LoadingOverlay currentTheme={currentTheme} withToast={false} />
      )}
    </ThemedView>
  );
};

export default EditNoticeScreen;
