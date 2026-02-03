import React, { useState, useRef } from "react";
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
import { router } from "expo-router";
import ThemedHeaderWithBack from "@/components/widgets/ThemedHeaderWithBack";
import { useTheme } from "@/contexts/themeContext";
import { useAuth } from "@/contexts/authContext";
import { useResidence } from "@/contexts/residenceContext";
import {
  NoticeCategory,
  NoticePriority,
  NoticeVisibility,
  CreateNoticeInput,
  NoticeAudience,
} from "@/types/models/notice";
import AudienceSelector from "@/components/manager/AudienceSelector";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import IconPillButton from "@/components/widgets/IconPillButton";
import basicColors from "@/themes/colors";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { createNotice } from "@/api/services/notice.service";
import BackButton from "@/components/widgets/BackButton";
import CategoryPill from "@/components/widgets/CategoryPill";

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

const CreateNoticeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentTheme, themedColors } = useTheme();
  const { user } = useAuth();
  const { currentResidence } = useResidence();
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const descriptionInputRef = useRef<View>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<NoticeCategory>(
    NoticeCategory.General,
  );
  const [priority, setPriority] = useState<NoticePriority>(
    NoticePriority.Normal,
  );
  const [audience, setAudience] = useState<NoticeAudience>({
    visibility: NoticeVisibility.All,
  });

  const handleDonePress = () => {
    if (!title.trim() || !description.trim()) {
      showErrorToast("Please fill in all required fields");
      return;
    }

    Alert.alert(
      "Publish Notice?",
      "This notice will be sent to all selected residents immediately.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Publish",
          onPress: handlePublish,
        },
      ],
    );
  };

  const handlePublish = async () => {
    if (!user?.id || !currentResidence?.society_id) {
      showErrorToast("Missing required information");
      return;
    }

    Keyboard.dismiss();

    setIsLoading(true);

    const noticeInput: CreateNoticeInput = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      audience,
    };

    try {
      const { data, error } = await createNotice(
        currentResidence.society_id,
        user.id,
        noticeInput,
      );

      if (error) {
        console.error("Error creating notice:", error);
        showErrorToast("Failed to publish notice");
      } else {
        showSuccessToast("Notice published successfully!");
        router.back();
      }
    } catch (error) {
      console.error("Error creating notice:", error);
      showErrorToast("Failed to publish notice");
    } finally {
      setIsLoading(false);
    }
  };

  const canPublish = title.trim().length > 0 && description.trim().length > 0;

  return (
    <ThemedView className="flex-1">
      <StatusBar barStyle="default" animated />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ marginTop: insets.top }} className="flex-1">
          <View className="px-3 pt-3 pb-3">
            <View className="flex-row items-center justify-between">
              <BackButton onPress={() => router.back()} />
              <TouchableOpacity
                onPress={handleDonePress}
                disabled={!canPublish || isLoading}
                className="py-2 px-4 rounded-lg"
                style={{
                  opacity: canPublish && !isLoading ? 1 : 0.5,
                }}
              >
                <ThemedText
                  className="text-base font-uber-move-bold"
                  style={{ color: themedColors.accent }}
                >
                  Create
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-6 mt-2"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="py-2 space-y-6">
              <View>
                <ThemedText className="text-base tracking-wider font-uber-move-medium mb-2.5">
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
                <ThemedText className="text-base tracking-wider font-uber-move-medium mb-2.5 mt-2">
                  Choose notice category
                </ThemedText>
                <View
                  className="flex-row flex-wrap"
                  style={{ columnGap: 4, rowGap: 4 }}
                >
                  {Object.values(NoticeCategory).map((cat) => (
                    <CategoryPill
                      key={cat}
                      label={CATEGORY_LABELS[cat]}
                      value={CATEGORY_LABELS[cat]}
                      isSelected={category === cat}
                      onPress={() => setCategory(cat)}
                      iconKey={CATEGORY_LABELS[cat].toLocaleLowerCase()}
                    />
                  ))}
                </View>
              </View>

              <View>
                <ThemedText className="text-base tracking-wider font-uber-move-medium mb-2.5 mt-2">
                  How important is this?
                </ThemedText>
                <View
                  className="flex-row flex-wrap"
                  style={{ columnGap: 4, rowGap: 4 }}
                >
                  {Object.values(NoticePriority).map((pri) => (
                    <CategoryPill
                      key={pri}
                      label={PRIORITY_LABELS[pri]}
                      value={pri}
                      isSelected={priority === pri}
                      onPress={() => setPriority(pri)}
                      iconKey={PRIORITY_LABELS[pri].toLocaleLowerCase()}
                    />
                  ))}
                </View>
              </View>

              <View ref={descriptionInputRef}>
                <ThemedText className="text-base tracking-wider font-uber-move-medium mb-2.5 mt-2">
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
                <ThemedText className="text-base tracking-wider font-uber-move-medium mb-2.5 mt-2">
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
      {isLoading && (
        <LoadingOverlay currentTheme={currentTheme} withToast={false} />
      )}
    </ThemedView>
  );
};

export default CreateNoticeScreen;
