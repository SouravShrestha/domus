import React, { useRef, useState } from "react";
import {
  StatusBar,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedText,
  ThemedTextSecondary,
  ThemedView,
} from "@themes/themedComponents";
import { router } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { useAuth } from "@/contexts/authContext";
import { useResidence } from "@/contexts/residenceContext";
import BackButton from "@/components/widgets/BackButton";
import { createComplaint } from "@/api/services/complaint.service";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import LoadingOverlay from "@/components/widgets/LoadingOverlay";
import {
  UserPlumberIcon,
  BroomIcon,
  ItAltIcon,
  UserPoliceIcon,
  PlugCableIcon,
  HomeIcon,
  BuildingIcon,
} from "@/components/icons";
import basicColors from "@/themes/colors";
import { ComplaintLevel } from "@/api/interfaces/complaint.interface";

const CATEGORIES = [
  {
    name: "General",
    icon: ItAltIcon,
    color: basicColors.brightGreen,
    size: 15,
  },
  {
    name: "Plumbing",
    icon: UserPlumberIcon,
    color: basicColors.skyBlue,
    size: 16,
  },
  {
    name: "Electrical",
    icon: PlugCableIcon,
    color: basicColors.gold,
    size: 16,
  },
  {
    name: "Security",
    icon: UserPoliceIcon,
    color: basicColors.teal,
    size: 16,
  },
  { name: "Cleaning", icon: BroomIcon, color: basicColors.orange, size: 14 },
] as const;

const LEVELS = [
  {
    value: "resident" as ComplaintLevel,
    label: "Resident",
    description: "Only visible to you and management",
    icon: HomeIcon,
    color: basicColors.brightGreen,
    size: 16,
  },
  {
    value: "society" as ComplaintLevel,
    label: "Society",
    description: "Visible to all society members",
    icon: BuildingIcon,
    color: basicColors.orange,
    size: 16,
  },
] as const;

const CreateComplaintScreen: React.FC = () => {
  const { themedColors, currentTheme } = useTheme();
  const { user, profile } = useAuth();
  const { currentResidence } = useResidence();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [level, setLevel] = useState<ComplaintLevel>("resident");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      showErrorToast("Please enter a title");
      return;
    }

    if (!user?.id || !currentResidence?.society?.id || !profile?.name) {
      showErrorToast("Unable to submit complaint");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await createComplaint({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        level,
        society_id: currentResidence.society.id,
        raised_by_name: profile.name,
      });

      if (error) throw error;

      showSuccessToast("Complaint raised successfully");
      router.back();
    } catch (error: any) {
      console.log(error);
      showErrorToast(error?.message || "Failed to create complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim().length > 0;

  return (
    <ThemedView className="flex-1 pt-4">
      <StatusBar barStyle="default" animated />
      <View
        className="flex-row items-center justify-between w-12 ml-2"
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <BackButton onPress={() => router.back()} color={themedColors.text} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={56}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <ThemedText className="text-2xl font-uber-move-medium tracking-wide mb-8 mt-2">
            raise a new complaint
          </ThemedText>

          <View className="mb-5">
            <ThemedText className="font-uber-move-medium tracking-wide mb-2 ml-1 text-sm">
              What is the issue?
            </ThemedText>
            <TextInput
              className="rounded-md px-4 border font-uber-move-medium tracking-wider"
              style={{
                height: 48,
                fontSize: 16,
                color: themedColors.text,
                borderColor: themedColors.lightBorder,
                backgroundColor: themedColors.inputBackground,
              }}
              placeholder="E.g. Water leak from terrace"
              placeholderTextColor={themedColors.placeholderText}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View className="mb-6">
            <ThemedText className="font-uber-move-medium tracking-wide mb-2 ml-1 text-sm">
              Choose category
            </ThemedText>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                rowGap: 10,
                columnGap: 8,
              }}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.name;
                const IconComponent = cat.icon;
                return (
                  <TouchableOpacity
                    key={cat.name}
                    onPress={() => setCategory(cat.name)}
                    className="px-4 py-2 rounded-full flex-row items-center"
                    style={{
                      backgroundColor: isSelected
                        ? cat.color + "30"
                        : themedColors.cardBackground,
                      borderWidth: 1,
                      borderColor: isSelected
                        ? cat.color
                        : themedColors.lightBorder,
                      gap: 6,
                    }}
                  >
                    <IconComponent
                      width={cat.size}
                      height={cat.size}
                      color={cat.color}
                    />
                    <Text
                      style={{
                        color: isSelected ? cat.color : themedColors.text,
                        fontFamily: "UberMoveMedium",
                        fontSize: 14,
                      }}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="mb-6">
            <ThemedText className="font-uber-move-medium tracking-wide mb-2 ml-1 text-sm">
              Visibility level
            </ThemedText>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
              }}
            >
              {LEVELS.map((lvl) => {
                const isSelected = level === lvl.value;
                const IconComponent = lvl.icon;
                return (
                  <TouchableOpacity
                    key={lvl.value}
                    onPress={() => setLevel(lvl.value)}
                    className="flex-1 p-3 rounded-lg"
                    style={{
                      backgroundColor: isSelected
                        ? lvl.color + "15"
                        : themedColors.cardBackground,
                      borderWidth: 1.5,
                      borderColor: isSelected
                        ? lvl.color
                        : themedColors.lightBorder,
                    }}
                  >
                    <View className="flex-row items-center mb-1.5">
                      <IconComponent
                        width={lvl.size}
                        height={lvl.size}
                        color={
                          isSelected ? lvl.color : themedColors.secondaryText
                        }
                      />
                      <Text
                        style={{
                          color: isSelected ? lvl.color : themedColors.text,
                          fontFamily: "UberMoveMedium",
                          fontSize: 14,
                          marginLeft: 6,
                        }}
                      >
                        {lvl.label}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: isSelected
                          ? themedColors.text
                          : themedColors.secondaryText,
                        fontFamily: "LatoRegular",
                        fontSize: 12,
                        lineHeight: 16,
                      }}
                    >
                      {lvl.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="mb-8">
            <View className="w-full flex-row items-center justify-between">
              <ThemedText className="font-uber-move-medium tracking-wide mb-2 ml-1 text-sm">
                Brief description of the issue
              </ThemedText>
            </View>
            <TextInput
              className="rounded-md px-4 py-3 border font-uber-move-medium tracking-wider"
              style={{
                minHeight: 120,
                fontSize: 16,
                color: themedColors.text,
                borderColor: themedColors.lightBorder,
                backgroundColor: themedColors.inputBackground,
                textAlignVertical: "top",
              }}
              placeholder="Describe the issue in detail..."
              placeholderTextColor={themedColors.placeholderText}
              value={description}
              onChangeText={setDescription}
              multiline
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="rounded-md items-center justify-center"
            style={{
              height: 54,
              backgroundColor: isFormValid
                ? themedColors.buttonBackground
                : themedColors.lightBorder,
            }}
          >
            <ThemedText
              className="font-uber-move-bold text-base tracking-wider"
              style={{
                color: isFormValid
                  ? themedColors.buttonText
                  : themedColors.text,
                opacity: isFormValid ? 1 : 0.4,
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      {isSubmitting && (
        <LoadingOverlay currentTheme={currentTheme} withToast={false} />
      )}
    </ThemedView>
  );
};

export default CreateComplaintScreen;
